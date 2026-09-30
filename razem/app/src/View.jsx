import { Fragment } from "react";
import { css } from "./css.js";
import MapView from "./MapView.jsx";

export default function View({ v }) {
  return (
    <>
      <div ref={v.screenRef} style={css("position:relative;width:100%;height:100%;overflow:hidden;background:#F4F1EA")}>
        <div style={css(`position:absolute;top:0;left:0;right:0;height:var(--sat);z-index:30;background:${v.statusBg}`)}></div>
        <div
          ref={v.scrollRef}
          style={css(`position:absolute;top:var(--sat);left:0;right:0;bottom:${v.contentBottom};overflow-y:auto;overflow-x:hidden;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior:contain`)}
        >
          {v.isOnb && (
            <>
              <div style={css("min-height:100%;display:flex;flex-direction:column;padding:12px 24px 40px")}>
                <div style={css("display:flex;justify-content:space-between;align-items:center;margin-bottom:18px")}>
                  <div style={css("font-weight:800;font-size:22px;letter-spacing:-.03em")}>
                    razem<span style={css("color:#C8102E")}>.</span>
                  </div>
                  <div style={css("display:flex;gap:2px;background:#E4DFD4;border-radius:9px;padding:3px")}>
                    {v.langs.map((l, i_l) => (
                      <Fragment key={i_l}>
                        <button
                          onClick={l.onClick}
                          style={css(
                            `border:0;border-radius:7px;padding:5px 9px;font:700 11px 'JetBrains Mono',monospace;cursor:pointer;background:${l.bg};color:${l.fg}`,
                          )}
                        >
                          {l.code}
                        </button>
                      </Fragment>
                    ))}
                  </div>
                </div>
                <div style={css("display:flex;gap:6px;margin-bottom:26px")}>
                  {v.onbDots.map((d, i_d) => (
                    <Fragment key={i_d}>
                      <div style={css(`height:4px;flex:1;border-radius:2px;background:${d.bg}`)}></div>
                    </Fragment>
                  ))}
                </div>
                {v.onb0 && (
                  <>
                    <div style={css("flex:1;display:flex;flex-direction:column")}>
                      <div
                        style={css(
                          `height:300px;border-radius:24px;background:${v.heroImg};background-color:#DCD6C9;display:flex;align-items:flex-end;padding:16px;font:600 11px 'JetBrains Mono',monospace;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.7)`,
                        )}
                      >
                        COLOSSEO · ROMA
                      </div>
                      <div style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#C8102E;margin:28px 0 10px")}>PL ⇄ IT</div>
                      <div style={css("font-size:34px;font-weight:800;line-height:1.05;letter-spacing:-.03em;text-wrap:balance")}>{v.t.onb0t}</div>
                      <div style={css("font-size:16px;line-height:1.45;color:#4A4C54;margin-top:12px;text-wrap:pretty")}>{v.t.onb0s}</div>
                      <div style={css("flex:1")}></div>
                      <button
                        onClick={v.onbNext}
                        style={css(
                          "margin-top:28px;height:56px;border:0;border-radius:16px;background:#16181D;color:#fff;font:700 17px 'Onest';cursor:pointer",
                        )}
                      >
                        {v.t.start}
                      </button>
                    </div>
                  </>
                )}
                {v.onb1 && (
                  <>
                    <div style={css("flex:1;display:flex;flex-direction:column")}>
                      <div style={css("font-size:30px;font-weight:800;letter-spacing:-.03em")}>{v.t.onb1t}</div>
                      <div style={css("font-size:15px;line-height:1.45;color:#4A4C54;margin-top:8px")}>{v.t.onb1s}</div>
                      <div style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.06em;color:#5E6068;margin:26px 0 8px")}>{v.t.codeLbl}</div>
                      <div style={css("display:flex;gap:8px")}>
                        <input
                          value={v.code}
                          onChange={v.onCode}
                          placeholder="RZM-0000"
                          style={css(
                            "flex:1;min-width:0;height:54px;border-radius:14px;border:1.5px solid #CFC9BC;background:#fff;padding:0 16px;font:700 18px 'JetBrains Mono',monospace;letter-spacing:.06em;color:#16181D;outline:none",
                          )}
                        />
                        <button
                          onClick={v.fetchTrip}
                          style={css(
                            "height:54px;padding:0 18px;border:0;border-radius:14px;background:#16181D;color:#fff;font:700 15px 'Onest';cursor:pointer",
                          )}
                        >
                          {v.t.fetch}
                        </button>
                      </div>
                      <button
                        onClick={v.useDemo}
                        style={css(
                          "align-self:flex-start;margin-top:10px;border:0;background:none;padding:0;color:#C8102E;font:600 13px 'Onest';cursor:pointer;text-decoration:underline",
                        )}
                      >
                        {v.t.demo}
                      </button>
                      {v.tripLoaded && (
                        <>
                          <div style={css("margin-top:22px;background:#fff;border-radius:20px;padding:6px 18px;border:1px solid rgba(22,24,29,.08)")}>
                            <div style={css("display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid rgba(22,24,29,.08)")}>
                              <span style={css("color:#5E6068;font-size:14px")}>{v.t.arrival}</span>
                              <span style={css("font-weight:700;font-size:14px")}>12.10 · 11:40 · LO 319</span>
                            </div>
                            <div style={css("display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid rgba(22,24,29,.08)")}>
                              <span style={css("color:#5E6068;font-size:14px")}>{v.t.airport}</span>
                              <span style={css("font-weight:700;font-size:14px")}>FCO · Fiumicino T3</span>
                            </div>
                            <div style={css("display:flex;justify-content:space-between;padding:14px 0;border-bottom:1px solid rgba(22,24,29,.08)")}>
                              <span style={css("color:#5E6068;font-size:14px")}>{v.t.hotelLbl}</span>
                              <span style={css("font-weight:700;font-size:14px")}>Hotel Artemide</span>
                            </div>
                            <div style={css("display:flex;justify-content:space-between;padding:14px 0")}>
                              <span style={css("color:#5E6068;font-size:14px")}>{v.t.agency}</span>
                              <span style={css("font-weight:700;font-size:14px")}>Wakacje z Rzymem</span>
                            </div>
                          </div>
                        </>
                      )}
                      <div style={css("flex:1")}></div>
                      <button
                        onClick={v.onbNext}
                        disabled={v.notLoaded}
                        style={css(
                          `margin-top:24px;height:56px;border:0;border-radius:16px;font:700 17px 'Onest';cursor:pointer;background:${v.onbBtnBg};color:#fff`,
                        )}
                      >
                        {v.t.continue}
                      </button>
                    </div>
                  </>
                )}
                {v.onb2 && (
                  <>
                    <div style={css("flex:1;display:flex;flex-direction:column")}>
                      <div style={css("font-size:30px;font-weight:800;letter-spacing:-.03em")}>{v.t.onbPt}</div>
                      <div style={css("font-size:15px;line-height:1.45;color:#4A4C54;margin-top:8px")}>{v.t.onbPs}</div>
                      <div style={css("margin-top:22px;background:#fff;border-radius:20px;padding:16px 18px;border:1px solid rgba(22,24,29,.08)")}>
                        <div style={css("font-weight:700;font-size:15px")}>{v.t.locTitle}</div>
                        <div style={css("font-size:13px;color:#5E6068;margin-top:3px;line-height:1.4")}>{v.t.locSub}</div>
                        <div style={css("display:flex;gap:2px;background:#F4F1EA;border-radius:12px;padding:3px;margin-top:12px")}>
                          {v.locOpts.map((lo, i_lo) => (
                            <Fragment key={i_lo}>
                              <button
                                onClick={lo.onClick}
                                style={css(
                                  `flex:1;border:0;border-radius:10px;height:38px;font:600 12px 'Onest';cursor:pointer;background:${lo.bg};color:${lo.fg}`,
                                )}
                              >
                                {lo.label}
                              </button>
                            </Fragment>
                          ))}
                        </div>
                      </div>
                      <div
                        style={css(
                          "margin-top:8px;background:#fff;border-radius:20px;padding:16px 18px;border:1px solid rgba(22,24,29,.08);display:flex;flex-direction:column;gap:10px;font-size:13px;line-height:1.4;color:#33353C",
                        )}
                      >
                        <div style={css("display:flex;gap:10px")}>
                          <span style={css("font:700 11px 'JetBrains Mono',monospace;color:#1F8A5B;padding-top:1px")}>DOC</span>
                          {v.t.pDocsSub}
                        </div>
                        <div style={css("display:flex;gap:10px")}>
                          <span style={css("font:700 11px 'JetBrains Mono',monospace;color:#1F8A5B;padding-top:1px")}>DEL</span>
                          {v.t.pDelSub}
                        </div>
                      </div>
                      <button
                        onClick={v.toggleRodo}
                        style={css(
                          "margin-top:14px;display:flex;gap:12px;align-items:flex-start;text-align:left;border:0;background:none;padding:0;cursor:pointer;font:500 14px/1.4 'Onest';color:#16181D",
                        )}
                      >
                        <span
                          style={css(
                            `width:24px;height:24px;flex:none;border-radius:7px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:13px;background:${v.rodoBg};border:${v.rodoBorder}`,
                          )}
                        >
                          {v.rodoMark}
                        </span>
                        {v.t.accept}
                      </button>
                      <div style={css("flex:1")}></div>
                      <button
                        onClick={v.onbNext}
                        disabled={v.noRodo}
                        style={css(
                          `margin-top:24px;height:56px;border:0;border-radius:16px;font:700 17px 'Onest';cursor:pointer;background:${v.rodoBtnBg};color:#fff`,
                        )}
                      >
                        {v.t.continue}
                      </button>
                    </div>
                  </>
                )}
                {v.onb3 && (
                  <>
                    <div style={css("flex:1;display:flex;flex-direction:column")}>
                      <div style={css("font-size:30px;font-weight:800;letter-spacing:-.03em;text-wrap:balance")}>{v.t.onb2t}</div>
                      <div style={css("font-size:15px;line-height:1.45;color:#4A4C54;margin-top:8px")}>{v.t.onb2s}</div>
                      <div style={css("margin-top:26px;background:#16181D;color:#fff;border-radius:24px;padding:22px")}>
                        <div style={css("display:flex;gap:14px;align-items:center")}>
                          <div
                            style={css(
                              "width:72px;height:72px;border-radius:50%;background:#F2B33D;color:#16181D;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:24px",
                            )}
                          >
                            MK
                          </div>
                          <div>
                            <div style={css("font-size:21px;font-weight:700")}>Marta Kowalska</div>
                            <div style={css("font-size:13px;color:#C9CBD1;margin-top:3px")}>{v.t.martaLangs}</div>
                            <div style={css("display:flex;align-items:center;gap:6px;font-size:13px;color:#6FD39F;margin-top:6px")}>
                              <span style={css("width:8px;height:8px;border-radius:50%;background:#3DBE7A")}></span>
                              {v.t.online}
                            </div>
                          </div>
                        </div>
                        <div
                          style={css(
                            "font-size:14px;line-height:1.5;color:#E3E4E8;margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,.14)",
                          )}
                        >
                          {v.t.martaQuote}
                        </div>
                      </div>
                      <div style={css("display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px")}>
                        <div style={css("background:#fff;border-radius:14px;padding:12px;font-size:12px;color:#5E6068")}>
                          <div style={css("font-weight:700;font-size:15px;color:#16181D")}>24/7</div>
                          {v.t.chat}
                        </div>
                        <div style={css("background:#fff;border-radius:14px;padding:12px;font-size:12px;color:#5E6068")}>
                          <div style={css("font-weight:700;font-size:15px;color:#16181D")}>{"< 2 min"}</div>
                          {v.t.response}
                        </div>
                        <div style={css("background:#fff;border-radius:14px;padding:12px;font-size:12px;color:#5E6068")}>
                          <div style={css("font-weight:700;font-size:15px;color:#16181D")}>PL · IT</div>
                          {v.t.languages}
                        </div>
                      </div>
                      <div style={css("flex:1")}></div>
                      <button
                        onClick={v.onbNext}
                        style={css(
                          "margin-top:24px;height:56px;border:0;border-radius:16px;background:#C8102E;color:#fff;font:700 17px 'Onest';cursor:pointer",
                        )}
                      >
                        {v.t.enter}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
          {v.isWelcome && (
            <>
              <div
                style={css(
                  `position:relative;min-height:100%;display:flex;flex-direction:column;color:#fff;background:${v.welcomeImg};background-color:#16181D`,
                )}
              >
                <div style={css("padding:28px 24px 0")}>
                  <div style={css("font:700 12px 'JetBrains Mono',monospace;letter-spacing:.1em;color:#F2B33D;text-shadow:0 1px 6px rgba(0,0,0,.6)")}>
                    {v.t.wLanded}
                  </div>
                  <div style={css("font-size:22px;font-weight:700;margin-top:18px;text-shadow:0 2px 10px rgba(0,0,0,.6)")}>{v.t.wHello}</div>
                  <div style={css("font-size:64px;font-weight:800;letter-spacing:-.04em;line-height:.95;margin-top:4px;text-shadow:0 2px 16px rgba(0,0,0,.6)")}>
                    {v.t.wCity}
                  </div>
                  <div style={css("font-size:15px;margin-top:12px;text-shadow:0 1px 8px rgba(0,0,0,.7)")}>{v.t.wSub}</div>
                </div>
                <div style={css("flex:1")}></div>
                <div style={css("margin:0 14px 22px;background:#F4F1EA;color:#16181D;border-radius:26px;padding:18px")}>
                  <div style={css("display:flex;gap:12px;align-items:center")}>
                    <div
                      style={css(
                        "width:52px;height:52px;flex:none;border-radius:14px;border:1.5px dashed #B9B2A3;display:flex;align-items:center;justify-content:center;font:700 10px 'JetBrains Mono',monospace;color:#5E6068;background:#fff",
                      )}
                    >
                      LOGO
                    </div>
                    <div>
                      <div style={css("font:700 10px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#C8102E")}>{v.t.wFrom}</div>
                      <div style={css("font-weight:800;font-size:17px")}>Wakacje z Rzymem</div>
                    </div>
                  </div>
                  <div style={css("font-size:15px;line-height:1.5;margin-top:12px;color:#33353C")}>{v.t.wThanks}</div>
                  <button
                    onClick={v.enterHome}
                    style={css(
                      "width:100%;margin-top:16px;height:56px;border:0;border-radius:16px;background:#C8102E;color:#fff;font:700 16px 'Onest';cursor:pointer",
                    )}
                  >
                    {v.t.wStart}
                  </button>
                </div>
              </div>
            </>
          )}
          {v.isHome && (
            <>
              <div style={css("padding:8px 20px 28px")}>
                <div style={css("display:flex;justify-content:space-between;align-items:center")}>
                  <div style={css("display:flex;align-items:center;gap:6px")}>
                    <div style={css("font-weight:800;font-size:21px;letter-spacing:-.03em")}>
                      razem<span style={css("color:#C8102E")}>.</span>
                    </div>
                    <button
                      onClick={v.openCity}
                      style={css(
                        "flex:none;white-space:nowrap;border:1px solid rgba(22,24,29,.15);background:#fff;border-radius:999px;padding:5px 10px;font:600 13px 'Onest';cursor:pointer;color:#16181D",
                      )}
                    >
                      {v.t.cityRome}
                      {" ▾"}
                    </button>
                  </div>
                  <div style={css("display:flex;gap:6px;align-items:center")}>
                    <div data-guide="lang" style={css("display:flex;gap:2px;background:#E4DFD4;border-radius:9px;padding:3px")}>
                      {v.langs.map((l, i_l) => (
                        <Fragment key={i_l}>
                          <button
                            onClick={l.onClick}
                            style={css(
                              `border:0;border-radius:7px;padding:5px 7px;font:700 11px 'JetBrains Mono',monospace;cursor:pointer;background:${l.bg};color:${l.fg}`,
                            )}
                          >
                            {l.code}
                          </button>
                        </Fragment>
                      ))}
                    </div>
                    <button
                      data-guide="help"
                      onClick={v.openGuide}
                      title="?"
                      style={css(
                        "width:34px;height:34px;border-radius:50%;border:2px solid #16181D;background:#F2B33D;font:800 16px 'Onest';cursor:pointer;color:#16181D",
                      )}
                    >
                      ?
                    </button>
                  </div>
                </div>
                <div style={css("display:flex;justify-content:space-between;align-items:flex-end;margin:22px 0 16px")}>
                  <div>
                    <div style={css("font-size:30px;font-weight:800;letter-spacing:-.03em")}>{v.t.greet}</div>
                    <div style={css("font-size:14px;color:#5E6068;margin-top:4px")}>{v.t.dayOf}</div>
                    <button
                      onClick={v.goPrivacy}
                      style={css(
                        "display:flex;align-items:center;gap:6px;margin-top:8px;border:0;background:none;padding:0;cursor:pointer;font:500 12px 'Onest';color:#33353C",
                      )}
                    >
                      <span style={css(`width:7px;height:7px;border-radius:50%;background:${v.locDot}`)}></span>
                      {v.locLine}
                    </button>
                  </div>
                  <button
                    data-guide="sos"
                    onClick={v.goSos}
                    style={css(
                      "width:58px;height:58px;border-radius:50%;border:0;background:#C8102E;color:#fff;font:800 14px 'JetBrains Mono',monospace;cursor:pointer;box-shadow:0 8px 18px -6px rgba(200,16,46,.6)",
                    )}
                  >
                    SOS
                  </button>
                </div>
                <div style={css("background:#fff;border-radius:20px;padding:12px 14px;margin-bottom:12px;border:1px solid rgba(22,24,29,.07)")}>
                  <div style={css("display:flex;justify-content:space-between;align-items:baseline")}>
                    <span style={css("font:700 10px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#5E6068")}>{v.t.weatherT}</span>
                    <span style={css("font:700 10px 'JetBrains Mono',monospace;color:#1C5FB8")}>{v.t.weatherSrc}</span>
                  </div>
                  <div style={css("display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-top:10px")}>
                    {v.weather.map((w, i_w) => (
                      <Fragment key={i_w}>
                        <div
                          style={css(`display:flex;flex-direction:column;align-items:center;gap:5px;padding:6px 0;border-radius:12px;background:${w.cardBg}`)}
                        >
                          <span style={css("font-size:11px;font-weight:600;color:#5E6068")}>{w.day}</span>
                          <span style={css(`width:20px;height:${w.iconH};border-radius:${w.iconR};background:${w.iconBg};box-shadow:${w.iconShadow}`)}></span>
                          <span style={css("font:700 13px 'JetBrains Mono',monospace")}>{w.hi}°</span>
                          <span style={css("font:500 10px 'JetBrains Mono',monospace;color:#8A8D96")}>{w.lo}°</span>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  <div style={css("font-size:12px;color:#33353C;margin-top:8px;line-height:1.4")}>{v.t.rainTip}</div>
                </div>
                {v.offline && (
                  <>
                    <div style={css("background:#16181D;color:#fff;border-radius:20px;padding:16px;margin-bottom:12px")}>
                      <div style={css("display:flex;justify-content:space-between;align-items:center")}>
                        <span style={css("font:700 10px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#F2B33D")}>
                          {"● "}
                          {v.t.offTag}
                        </span>
                        <button
                          onClick={v.toggleNet}
                          style={css(
                            "border:0;background:rgba(255,255,255,.12);color:#fff;border-radius:8px;padding:4px 8px;font:600 11px 'Onest';cursor:pointer",
                          )}
                        >
                          {v.t.offRetry}
                        </button>
                      </div>
                      <div style={css("font-size:16px;font-weight:800;margin-top:6px")}>{v.t.offTitle}</div>
                      <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;margin-top:10px")}>
                        {v.offList.map((ol, i_ol) => (
                          <Fragment key={i_ol}>
                            <div style={css(`display:flex;gap:6px;align-items:baseline;font-size:12px;line-height:1.35;color:${ol.fg}`)}>
                              <span style={css(`font:700 10px 'JetBrains Mono',monospace;color:${ol.mark}`)}>{ol.icon}</span>
                              {ol.label}
                            </div>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {v.showSafety && (
                  <>
                    <div style={css("background:#F2B33D;border-radius:20px;padding:14px 16px;margin-bottom:12px;display:flex;gap:12px;align-items:flex-start")}>
                      <div
                        style={css(
                          "width:40px;height:40px;flex:none;border-radius:12px;background:#16181D;color:#F2B33D;display:flex;align-items:center;justify-content:center;font:800 16px 'Onest'",
                        )}
                      >
                        !
                      </div>
                      <div style={css("flex:1")}>
                        <div style={css("font:700 10px 'JetBrains Mono',monospace;letter-spacing:.08em")}>{v.t.sfTag}</div>
                        <div style={css("font-size:16px;font-weight:800;margin-top:3px;line-height:1.2")}>{v.t.sfTitle}</div>
                        <div style={css("font-size:13px;margin-top:4px;line-height:1.4;color:#3A2E0E")}>{v.t.sfSub}</div>
                        <button
                          onClick={v.goTips}
                          style={css(
                            "margin-top:8px;border:0;background:none;padding:0;font:700 13px 'Onest';color:#16181D;cursor:pointer;text-decoration:underline",
                          )}
                        >
                          {v.t.sfMore}
                        </button>
                      </div>
                      <button
                        onClick={v.hideSafety}
                        style={css(
                          "width:32px;height:32px;flex:none;border-radius:10px;border:0;background:rgba(22,24,29,.12);font:600 13px 'Onest';cursor:pointer;color:#16181D",
                        )}
                      >
                        ✕
                      </button>
                    </div>
                  </>
                )}
                {v.showStrike && (
                  <>
                    <div style={css("background:#fff;border:2px solid #C8102E;border-radius:20px;padding:14px 16px;margin-bottom:12px")}>
                      <div style={css("display:flex;justify-content:space-between;align-items:center")}>
                        <span style={css("font:700 10px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#C8102E")}>
                          {"● "}
                          {v.t.strikeTag}
                        </span>
                        <button
                          onClick={v.hideStrike}
                          style={css("width:28px;height:28px;border-radius:8px;border:0;background:#F4F1EA;font:600 12px 'Onest';cursor:pointer;color:#16181D")}
                        >
                          ✕
                        </button>
                      </div>
                      <div style={css("font-size:16px;font-weight:800;margin-top:4px;line-height:1.2")}>{v.t.strikeTitle}</div>
                      <div style={css("font-size:13px;color:#33353C;margin-top:4px;line-height:1.4")}>{v.t.strikeSub}</div>
                      <div style={css("font-size:13px;margin-top:8px;line-height:1.4;background:#E4F4EB;color:#1E4D35;border-radius:10px;padding:8px 10px")}>
                        <b>✓</b> {v.t.strikeFix}
                      </div>
                      <button
                        onClick={v.goTransport}
                        style={css(
                          "margin-top:10px;height:40px;padding:0 14px;border:0;border-radius:10px;background:#16181D;color:#fff;font:700 13px 'Onest';cursor:pointer",
                        )}
                      >
                        {v.t.strikePlan}
                        {" →"}
                      </button>
                    </div>
                  </>
                )}
                <div data-guide="next" onClick={v.goTransfer} style={css("background:#16181D;color:#fff;border-radius:24px;padding:20px;cursor:pointer")}>
                  <div style={css("display:flex;justify-content:space-between;font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#F2B33D")}>
                    <span>{v.t.next}</span>
                    <span>FCO → HTL</span>
                  </div>
                  <div style={css("font-size:23px;font-weight:700;margin-top:10px;letter-spacing:-.02em")}>{v.t.transfer}</div>
                  <div style={css("font-size:14px;color:#C9CBD1;margin-top:4px")}>{v.stageLabel}</div>
                  <div style={css("display:flex;gap:4px;margin-top:16px")}>
                    {v.stageBars.map((b, i_b) => (
                      <Fragment key={i_b}>
                        <div style={css(`height:5px;flex:1;border-radius:3px;background:${b.bg}`)}></div>
                      </Fragment>
                    ))}
                  </div>
                  <div style={css("display:flex;justify-content:space-between;align-items:center;margin-top:16px")}>
                    <span style={css("font-size:13px;color:#C9CBD1")}>Giorgio · AB 123 CD</span>
                    <span style={css("background:#F2B33D;color:#16181D;border-radius:10px;padding:8px 14px;font-weight:700;font-size:14px")}>
                      {v.t.open}
                      {" →"}
                    </span>
                  </div>
                </div>
                <div style={css("margin-top:12px;background:#fff;border-radius:20px;padding:14px 16px;border:1px solid rgba(22,24,29,.07)")}>
                  <div style={css("display:flex;justify-content:space-between;align-items:baseline")}>
                    <span style={css("font:700 10px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#5E6068")}>{v.t.crowdNow}</span>
                    <span style={css("font:700 10px 'JetBrains Mono',monospace;color:#1F8A5B")}>
                      {"● "}
                      {v.t.crowdAlways}
                    </span>
                  </div>
                  <div style={css("display:flex;flex-direction:column;margin-top:6px")}>
                    {v.crowdList.map((cr, i_cr) => (
                      <Fragment key={i_cr}>
                        <div style={css("display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(22,24,29,.06)")}>
                          <span
                            style={css(
                              `font:700 9px 'JetBrains Mono',monospace;min-width:52px;text-align:center;border-radius:6px;padding:4px 0;color:#fff;background:${cr.color}`,
                            )}
                          >
                            {cr.level}
                          </span>
                          <span style={css("flex:1;font-size:14px;font-weight:600")}>{cr.name}</span>
                          <span style={css("font-size:11px;color:#5E6068;text-align:right")}>{cr.best}</span>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  <button
                    onClick={v.goMapTab}
                    style={css("margin-top:10px;border:0;background:none;padding:0;color:#C8102E;font:600 13px 'Onest';cursor:pointer")}
                  >
                    {v.t.crowdMap}
                    {" →"}
                  </button>
                </div>
                <button
                  onClick={v.goTickets}
                  style={css(
                    "width:100%;margin-top:12px;display:flex;align-items:center;gap:12px;background:#fff;border:1px solid rgba(22,24,29,.07);border-radius:20px;padding:14px 16px;cursor:pointer;text-align:left;font-family:'Onest';color:#16181D",
                  )}
                >
                  <span
                    style={css(
                      "width:44px;height:44px;flex:none;border-radius:12px;background:#16181D;color:#F2B33D;display:flex;align-items:center;justify-content:center;font:700 12px 'JetBrains Mono',monospace",
                    )}
                  >
                    BLT
                  </span>
                  <span style={css("flex:1")}>
                    <span style={css("display:block;font-weight:700;font-size:16px")}>{v.t.tickets}</span>
                    <span style={css("display:block;font-size:12px;color:#5E6068;margin-top:2px")}>{v.ticketsLine}</span>
                  </span>
                  <span
                    style={css(
                      "min-width:28px;height:28px;border-radius:14px;background:#C8102E;color:#fff;display:flex;align-items:center;justify-content:center;font:700 13px 'JetBrains Mono',monospace;padding:0 8px",
                    )}
                  >
                    {v.ticketCount}
                  </span>
                </button>
                <div data-guide="marta" style={css("background:#fff;border-radius:22px;padding:16px;margin-top:12px;border:1px solid rgba(22,24,29,.07)")}>
                  <div style={css("display:flex;gap:12px;align-items:center")}>
                    <div
                      style={css(
                        "width:46px;height:46px;border-radius:50%;background:#F2B33D;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px",
                      )}
                    >
                      MK
                    </div>
                    <div style={css("flex:1")}>
                      <div style={css("font-size:12px;color:#5E6068")}>{v.t.assistantLbl}</div>
                      <div style={css("font-weight:700;font-size:16px")}>Marta Kowalska</div>
                    </div>
                    <div style={css("display:flex;align-items:center;gap:6px;font-size:12px;color:#1F8A5B;font-weight:600")}>
                      <span style={css("width:8px;height:8px;border-radius:50%;background:#3DBE7A")}></span>
                      {v.t.onlineShort}
                    </div>
                  </div>
                  <div style={css("display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:14px")}>
                    <button
                      onClick={v.goChat}
                      style={css("height:44px;border:0;border-radius:12px;background:#F4F1EA;font:600 14px 'Onest';color:#16181D;cursor:pointer")}
                    >
                      {v.t.write}
                    </button>
                    <button
                      onClick={v.callMarta}
                      style={css("height:44px;border:0;border-radius:12px;background:#F4F1EA;font:600 14px 'Onest';color:#16181D;cursor:pointer")}
                    >
                      {v.t.call}
                    </button>
                    <button
                      onClick={v.videoMarta}
                      style={css("height:44px;border:0;border-radius:12px;background:#F4F1EA;font:600 14px 'Onest';color:#16181D;cursor:pointer")}
                    >
                      {v.t.video}
                    </button>
                  </div>
                </div>
                <div style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#5E6068;margin:26px 0 12px")}>{v.t.everything}</div>
                <div data-guide="tiles" style={css("display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px 8px")}>
                  {v.tiles.map((it, i_it) => (
                    <Fragment key={i_it}>
                      <button
                        onClick={it.onClick}
                        style={css(
                          "border:0;background:none;padding:0;display:flex;flex-direction:column;align-items:center;gap:7px;cursor:pointer;color:#16181D",
                        )}
                      >
                        <div
                          style={css(
                            `width:62px;height:62px;border-radius:18px;background:#fff;border:1px solid rgba(22,24,29,.08);display:flex;align-items:center;justify-content:center;font:700 13px 'JetBrains Mono',monospace;color:${it.fg}`,
                          )}
                        >
                          {it.code}
                        </div>
                        <span style={css("font-size:12px;font-weight:500;text-align:center;line-height:1.2")}>{it.label}</span>
                      </button>
                    </Fragment>
                  ))}
                </div>
                <div style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#5E6068;margin:28px 0 10px")}>{v.t.inspire}</div>
                <div style={css("display:flex;gap:10px;margin:0 -20px;padding:0 20px;overflow-x:auto;scrollbar-width:none")}>
                  {v.inspo.map((ip, i_ip) => (
                    <Fragment key={i_ip}>
                      <button
                        onClick={ip.onClick}
                        style={css(
                          `flex:none;width:200px;height:250px;border:0;border-radius:22px;padding:14px;cursor:pointer;display:flex;flex-direction:column;justify-content:flex-end;text-align:left;color:#fff;font-family:'Onest';background:${ip.img};background-color:#DCD6C9`,
                        )}
                      >
                        <span style={css("font-size:18px;font-weight:800;line-height:1.1;text-shadow:0 1px 8px rgba(0,0,0,.9)")}>{ip.name}</span>
                        <span style={css("font:600 11px 'JetBrains Mono',monospace;margin-top:4px;text-shadow:0 1px 6px rgba(0,0,0,.9)")}>{ip.sub}</span>
                      </button>
                    </Fragment>
                  ))}
                </div>
                <div style={css("display:flex;justify-content:space-between;align-items:baseline;margin:28px 0 10px")}>
                  <span style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#5E6068")}>{v.t.plan}</span>
                  <button onClick={v.goTrip} style={css("border:0;background:none;color:#C8102E;font:600 13px 'Onest';cursor:pointer;padding:0")}>
                    {v.t.seeTrip}
                    {" →"}
                  </button>
                </div>
                <div style={css("background:#fff;border-radius:22px;padding:4px 16px;border:1px solid rgba(22,24,29,.07)")}>
                  {v.planToday.map((p, i_p) => (
                    <Fragment key={i_p}>
                      <div style={css("display:flex;gap:14px;padding:13px 0;border-bottom:1px solid rgba(22,24,29,.07);align-items:center")}>
                        <span style={css(`font:700 13px 'JetBrains Mono',monospace;width:44px;color:${p.timeColor}`)}>{p.time}</span>
                        <div style={css("flex:1")}>
                          <div style={css(`font-size:14px;font-weight:600;color:${p.color}`)}>{p.title}</div>
                          <div style={css("font-size:12px;color:#5E6068;margin-top:2px")}>{p.sub}</div>
                        </div>
                        <span style={css(`font:700 10px 'JetBrains Mono',monospace;color:${p.badgeColor}`)}>{p.badge}</span>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            </>
          )}
          {v.hasSubHeader && (
            <>
              <div
                style={css(
                  `position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:10px;padding:8px 16px 10px;background:${v.subHeaderBg};color:${v.subHeaderFg}`,
                )}
              >
                <button
                  onClick={v.back}
                  style={css(
                    `width:40px;height:40px;border-radius:12px;border:0;background:${v.backBg};color:${v.subHeaderFg};font:600 18px 'Onest';cursor:pointer`,
                  )}
                >
                  ←
                </button>
                <div style={css("font-size:18px;font-weight:700;flex:1")}>{v.subTitle}</div>
                <button
                  onClick={v.openGuide}
                  style={css(
                    `width:34px;height:34px;border-radius:50%;border:2px solid ${v.subHeaderFg};background:transparent;color:${v.subHeaderFg};font:800 15px 'Onest';cursor:pointer`,
                  )}
                >
                  ?
                </button>
              </div>
            </>
          )}
          {v.isTransfer && (
            <>
              <div style={css("padding:4px 20px 28px")}>
                <div style={css("background:#fff;border-radius:22px;padding:18px;border:1px solid rgba(22,24,29,.07)")}>
                  {v.stages.map((s, i_s) => (
                    <Fragment key={i_s}>
                      <div style={css("display:flex;gap:14px")}>
                        <div style={css("display:flex;flex-direction:column;align-items:center")}>
                          <div
                            style={css(
                              `width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:700 11px 'JetBrains Mono',monospace;background:${s.dotBg};color:${s.dotFg}`,
                            )}
                          >
                            {s.mark}
                          </div>
                          <div style={css(`width:2px;flex:1;min-height:18px;background:${s.lineBg}`)}></div>
                        </div>
                        <div style={css("padding-bottom:16px;flex:1")}>
                          <div style={css(`font-size:15px;font-weight:${s.weight};color:${s.color}`)}>{s.label}</div>
                          <div style={css("font-size:12px;color:#5E6068;margin-top:2px")}>{s.sub}</div>
                        </div>
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div style={css("margin-top:12px;background:#fff;border-radius:22px;padding:18px;border:2px solid #F2B33D;text-align:center")}>
                  <div style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#5E6068")}>{v.t.waitsWith}</div>
                  <div style={css("font-size:30px;font-weight:800;letter-spacing:-.02em;margin-top:8px")}>RAZEM · A. NOWAK</div>
                </div>
                <div style={css("margin-top:12px;background:#16181D;color:#fff;border-radius:22px;padding:18px")}>
                  <div style={css("display:flex;gap:14px;align-items:center")}>
                    <div
                      style={css(
                        "width:56px;height:56px;border-radius:16px;background:repeating-linear-gradient(135deg,#2A2D35 0 6px,#33363F 6px 12px);display:flex;align-items:center;justify-content:center;font:500 9px 'JetBrains Mono',monospace;color:#8A8D96",
                      )}
                    >
                      FOTO
                    </div>
                    <div style={css("flex:1")}>
                      <div style={css("font-size:17px;font-weight:700")}>Giorgio R.</div>
                      <div style={css("font-size:13px;color:#C9CBD1;margin-top:2px")}>
                        {"Mercedes Klasa V · "}
                        {v.t.black}
                      </div>
                    </div>
                    <div style={css("background:#fff;color:#16181D;border-radius:8px;padding:6px 8px;font:700 13px 'JetBrains Mono',monospace")}>AB 123 CD</div>
                  </div>
                  <div
                    style={css(
                      "display:flex;gap:10px;margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.14);font-size:14px;color:#E3E4E8",
                    )}
                  >
                    <span style={css("font:700 11px 'JetBrains Mono',monospace;color:#F2B33D;padding-top:2px")}>{v.t.meetAtLbl}</span>
                    <span>{v.t.meetAt}</span>
                  </div>
                  <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px")}>
                    <button
                      onClick={v.callDriver}
                      style={css("height:46px;border:0;border-radius:12px;background:#F2B33D;color:#16181D;font:700 14px 'Onest';cursor:pointer")}
                    >
                      {v.t.callDriver}
                    </button>
                    <button
                      onClick={v.goChat}
                      style={css(
                        "height:46px;border:1px solid rgba(255,255,255,.25);border-radius:12px;background:transparent;color:#fff;font:600 14px 'Onest';cursor:pointer",
                      )}
                    >
                      {v.t.writeMarta}
                    </button>
                  </div>
                </div>
                <button
                  onClick={v.nextStage}
                  style={css(
                    "width:100%;margin-top:14px;height:48px;border:1.5px dashed #B9B2A3;border-radius:14px;background:transparent;font:600 14px 'Onest';color:#4A4C54;cursor:pointer",
                  )}
                >
                  {v.t.nextStage}
                </button>
              </div>
            </>
          )}
          {v.isExplore && (
            <>
              <div style={css("padding:8px 20px 28px")}>
                <div style={css("font-size:30px;font-weight:800;letter-spacing:-.03em")}>{v.t.tabExplore}</div>
                <div style={css("font-size:14px;color:#5E6068;margin-top:4px")}>{v.t.exploreSub}</div>
                <div style={css("display:flex;gap:6px;margin:18px -20px 16px;padding:0 20px;overflow-x:auto;scrollbar-width:none")}>
                  {v.filters.map((f, i_f) => (
                    <Fragment key={i_f}>
                      <button
                        onClick={f.onClick}
                        style={css(
                          `flex:none;height:38px;padding:0 16px;border-radius:999px;font:600 14px 'Onest';cursor:pointer;background:${f.bg};color:${f.fg};border:${f.border}`,
                        )}
                      >
                        {f.label}
                      </button>
                    </Fragment>
                  ))}
                </div>
                <div style={css("display:flex;flex-direction:column;gap:12px")}>
                  {v.tourList.map((x, i_x) => (
                    <Fragment key={i_x}>
                      <div
                        onClick={x.onClick}
                        style={css("background:#fff;border-radius:22px;overflow:hidden;border:1px solid rgba(22,24,29,.07);cursor:pointer")}
                      >
                        <div
                          style={css(
                            `height:150px;background:${x.img};background-color:#DCD6C9;position:relative;display:flex;align-items:flex-end;padding:10px 12px;font:600 10px 'JetBrains Mono',monospace;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.8)`,
                          )}
                        >
                          {x.photo}
                          <span
                            style={css(
                              "position:absolute;top:10px;left:12px;background:#16181D;color:#fff;border-radius:6px;padding:4px 7px;font:700 11px 'JetBrains Mono',monospace",
                            )}
                          >
                            {x.code}
                          </span>
                          <span
                            style={css(
                              `position:absolute;top:10px;right:12px;border-radius:6px;padding:4px 7px;font:700 10px 'JetBrains Mono',monospace;background:${x.statusBg};color:${x.statusFg}`,
                            )}
                          >
                            {x.status}
                          </span>
                        </div>
                        <div style={css("padding:14px 16px 16px")}>
                          <div style={css("font-size:16px;font-weight:700;line-height:1.25")}>{x.title}</div>
                          <div style={css("font-size:13px;color:#5E6068;margin-top:4px")}>{x.desc}</div>
                          <div style={css("display:flex;gap:12px;margin-top:10px;font:700 12px 'JetBrains Mono',monospace;color:#16181D")}>
                            <span>{x.dur}</span>
                            <span style={css("color:#1F8A5B")}>{v.t.guidePl}</span>
                            <span style={css("margin-left:auto")}>
                              {v.t.from} {x.price}
                            </span>
                          </div>
                          <div style={css(`display:flex;align-items:center;gap:6px;margin-top:8px;font-size:12px;font-weight:600;color:${x.availFg}`)}>
                            <span style={css(`width:7px;height:7px;border-radius:50%;background:${x.availDot}`)}></span>
                            {x.availText}
                          </div>
                        </div>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            </>
          )}
          {v.isTour && (
            <>
              <div style={css("padding:0 20px 28px")}>
                <div
                  style={css(
                    `height:220px;border-radius:22px;background:${v.tour.img};background-color:#DCD6C9;display:flex;align-items:flex-end;padding:14px;font:600 11px 'JetBrains Mono',monospace;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.8)`,
                  )}
                >
                  {v.tour.photo}
                </div>
                <div style={css("font-size:24px;font-weight:800;letter-spacing:-.02em;line-height:1.15;margin-top:16px;text-wrap:balance")}>{v.tour.title}</div>
                <div style={css("font-size:14px;color:#4A4C54;margin-top:6px;line-height:1.45")}>{v.tour.desc}</div>
                <div style={css("display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:14px")}>
                  <div style={css("background:#fff;border-radius:14px;padding:10px 12px")}>
                    <div style={css("font-size:11px;color:#5E6068")}>{v.t.duration}</div>
                    <div style={css("font-weight:700;font-size:15px")}>{v.tour.dur}</div>
                  </div>
                  <div style={css("background:#fff;border-radius:14px;padding:10px 12px")}>
                    <div style={css("font-size:11px;color:#5E6068")}>{v.t.guide}</div>
                    <div style={css("font-weight:700;font-size:15px")}>PL</div>
                  </div>
                  <div style={css("background:#fff;border-radius:14px;padding:10px 12px")}>
                    <div style={css("font-size:11px;color:#5E6068")}>{v.t.perPerson}</div>
                    <div style={css("font-weight:700;font-size:15px")}>{v.tour.price}</div>
                  </div>
                </div>
                {v.tourIdle && (
                  <>
                    <div style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#5E6068;margin:22px 0 8px")}>{v.t.date}</div>
                    <div style={css("display:flex;gap:6px")}>
                      {v.dateOpts.map((o, i_o) => (
                        <Fragment key={i_o}>
                          <button
                            onClick={o.onClick}
                            style={css(
                              `flex:1;height:54px;border-radius:12px;font:700 14px 'JetBrains Mono',monospace;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:${o.bg};color:${o.fg};border:${o.border}`,
                            )}
                          >
                            {o.label}
                            <span style={css(`display:flex;align-items:center;gap:4px;font:700 9px 'JetBrains Mono',monospace;color:${o.subFg}`)}>
                              <span style={css(`width:6px;height:6px;border-radius:50%;background:${o.dot}`)}></span>
                              {o.sub}
                            </span>
                          </button>
                        </Fragment>
                      ))}
                    </div>
                    <div style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#5E6068;margin:16px 0 8px")}>{v.t.time}</div>
                    <div style={css("display:flex;gap:6px")}>
                      {v.timeOpts.map((o, i_o) => (
                        <Fragment key={i_o}>
                          <button
                            onClick={o.onClick}
                            disabled={o.disabled}
                            style={css(
                              `flex:1;height:54px;border-radius:12px;font:700 14px 'JetBrains Mono',monospace;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:${o.bg};color:${o.fg};border:${o.border};cursor:${o.cursor};text-decoration:${o.strike}`,
                            )}
                          >
                            {o.label}
                            <span style={css(`font:700 9px 'JetBrains Mono',monospace;letter-spacing:.02em;color:${o.subFg}`)}>{o.sub}</span>
                          </button>
                        </Fragment>
                      ))}
                    </div>
                    <div
                      style={css(
                        "display:flex;justify-content:space-between;align-items:center;margin-top:16px;background:#fff;border-radius:14px;padding:8px 8px 8px 16px",
                      )}
                    >
                      <span style={css("font-weight:600;font-size:15px")}>{v.t.people}</span>
                      <div style={css("display:flex;align-items:center;gap:14px")}>
                        <button
                          onClick={v.decP}
                          style={css(
                            "width:44px;height:44px;border-radius:12px;border:0;background:#F4F1EA;font:600 20px 'Onest';cursor:pointer;color:#16181D",
                          )}
                        >
                          −
                        </button>
                        <span style={css("font:700 17px 'JetBrains Mono',monospace;min-width:14px;text-align:center")}>{v.people}</span>
                        <button
                          onClick={v.incP}
                          style={css(
                            "width:44px;height:44px;border-radius:12px;border:0;background:#F4F1EA;font:600 20px 'Onest';cursor:pointer;color:#16181D",
                          )}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div
                      style={css(
                        `display:flex;gap:10px;align-items:center;margin-top:12px;border-radius:14px;padding:12px 14px;background:${v.availBg};color:${v.availFg}`,
                      )}
                    >
                      <span style={css(`width:10px;height:10px;flex:none;border-radius:50%;background:${v.availDot}`)}></span>
                      <span style={css("flex:1;font-size:13px;font-weight:600;line-height:1.35")}>{v.availLine}</span>
                      <span style={css("font:700 10px 'JetBrains Mono',monospace;opacity:.8")}>{v.t.live}</span>
                    </div>
                    {v.tourHasTicket && (
                      <>
                        <div style={css("margin-top:14px;background:#16181D;color:#fff;border-radius:18px;padding:14px 16px")}>
                          <div style={css("display:flex;justify-content:space-between;align-items:baseline")}>
                            <span style={css("font:700 10px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#F2B33D")}>{v.t.ticketOnly}</span>
                            <span style={css("font:700 15px 'JetBrains Mono',monospace")}>
                              {v.tour.tprice}
                              {" / os."}
                            </span>
                          </div>
                          <div style={css("font-size:13px;color:#C9CBD1;margin-top:4px;line-height:1.4")}>{v.t.ticketOnlySub}</div>
                          <button
                            onClick={v.buyTourTicket}
                            disabled={v.cantBook}
                            style={css(
                              `width:100%;margin-top:10px;height:48px;border:0;border-radius:12px;opacity:${v.bookOpacity};background:#F2B33D;color:#16181D;font:700 15px 'Onest';cursor:pointer`,
                            )}
                          >
                            {v.t.buyWithPhone}
                            {" · "}
                            {v.ticketTotal}
                          </button>
                        </div>
                        <div style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.06em;color:#5E6068;margin:16px 0 0;text-align:center")}>
                          {v.t.guidedOr}
                        </div>
                      </>
                    )}
                    <div style={css("display:flex;gap:10px;align-items:center;margin-top:14px;font-size:13px;color:#4A4C54;line-height:1.4")}>
                      <div
                        style={css(
                          "width:30px;height:30px;flex:none;border-radius:50%;background:#F2B33D;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:#16181D",
                        )}
                      >
                        MK
                      </div>
                      {v.t.reqNote}
                    </div>
                    <button
                      onClick={v.sendRequest}
                      disabled={v.cantBook}
                      style={css(
                        `width:100%;margin-top:16px;height:56px;border:0;border-radius:16px;opacity:${v.bookOpacity};background:#16181D;color:#fff;font:700 16px 'Onest';cursor:pointer`,
                      )}
                    >
                      {v.t.sendReq}
                      {" · "}
                      {v.total}
                    </button>
                  </>
                )}
                {v.tourPending && (
                  <>
                    <div style={css("margin-top:22px;background:#FFF6DF;border:1.5px solid #F2B33D;border-radius:20px;padding:18px")}>
                      <div style={css("display:flex;align-items:center;gap:10px")}>
                        <span style={css("position:relative;width:12px;height:12px")}>
                          <span style={css("position:absolute;inset:0;border-radius:50%;background:#E0A21F")}></span>
                        </span>
                        <span style={css("font-weight:700;font-size:16px")}>{v.t.pending}</span>
                      </div>
                      <div style={css("font-size:14px;color:#4A4C54;margin-top:8px;line-height:1.45")}>{v.t.pendingSub}</div>
                      <div style={css("font:700 13px 'JetBrains Mono',monospace;margin-top:12px")}>{v.bookingLine}</div>
                    </div>
                  </>
                )}
                {v.tourConfirmed && (
                  <>
                    <div style={css("margin-top:22px;background:#E4F4EB;border:1.5px solid #3DBE7A;border-radius:20px;padding:18px")}>
                      <div style={css("display:flex;align-items:center;gap:10px")}>
                        <span
                          style={css(
                            "width:24px;height:24px;border-radius:50%;background:#1F8A5B;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px",
                          )}
                        >
                          ✓
                        </span>
                        <span style={css("font-weight:700;font-size:16px")}>{v.t.confirmed}</span>
                      </div>
                      <div style={css("font-size:14px;color:#2F4A3B;margin-top:8px;line-height:1.45")}>{v.t.confirmedSub}</div>
                      <div style={css("font:700 13px 'JetBrains Mono',monospace;margin-top:12px")}>{v.bookingLine}</div>
                      <button
                        onClick={v.goChat}
                        style={css(
                          "margin-top:14px;height:44px;padding:0 16px;border:0;border-radius:12px;background:#1F8A5B;color:#fff;font:700 14px 'Onest';cursor:pointer",
                        )}
                      >
                        {v.t.openVoucher}
                        {" →"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
          {v.isHelp && (
            <>
              <div style={css("padding:8px 20px 28px")}>
                <div style={css("font-size:30px;font-weight:800;letter-spacing:-.03em")}>{v.t.helpT}</div>
                <div style={css("font-size:14px;color:#5E6068;margin-top:4px")}>{v.t.helpS}</div>
                <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px")}>
                  {v.cats.map((c, i_c) => (
                    <Fragment key={i_c}>
                      <button
                        onClick={c.onClick}
                        style={css(
                          `min-height:76px;border-radius:16px;padding:12px 14px;text-align:left;font:600 14px/1.25 'Onest';cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;gap:8px;background:${c.bg};color:${c.fg};border:${c.border}`,
                        )}
                      >
                        <span style={css("font:700 11px 'JetBrains Mono',monospace;opacity:.7")}>{c.code}</span>
                        {c.label}
                      </button>
                    </Fragment>
                  ))}
                </div>
                <textarea
                  value={v.helpText}
                  onChange={v.onHelpText}
                  placeholder={v.t.describe}
                  style={css(
                    "width:100%;margin-top:12px;height:88px;border-radius:16px;border:1.5px solid #CFC9BC;background:#fff;padding:12px 14px;font-size:15px;resize:none;outline:none;color:#16181D",
                  )}
                ></textarea>
                <button
                  onClick={v.sendHelp}
                  disabled={v.noCat}
                  style={css(
                    `width:100%;margin-top:12px;height:56px;border:0;border-radius:16px;color:#fff;font:700 16px 'Onest';cursor:pointer;background:${v.helpBtnBg}`,
                  )}
                >
                  {v.t.connect}
                </button>
                <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px")}>
                  <button
                    onClick={v.callMarta}
                    style={css(
                      "height:48px;border:1px solid rgba(22,24,29,.15);border-radius:14px;background:#fff;font:600 14px 'Onest';color:#16181D;cursor:pointer",
                    )}
                  >
                    {v.t.call}
                  </button>
                  <button
                    onClick={v.videoMarta}
                    style={css(
                      "height:48px;border:1px solid rgba(22,24,29,.15);border-radius:14px;background:#fff;font:600 14px 'Onest';color:#16181D;cursor:pointer",
                    )}
                  >
                    {v.t.video}
                  </button>
                </div>
                <button
                  onClick={v.goSos}
                  style={css(
                    "width:100%;margin-top:18px;height:56px;border:0;border-radius:16px;background:#C8102E;color:#fff;font:700 16px 'Onest';cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px",
                  )}
                >
                  <span style={css("font:800 13px 'JetBrains Mono',monospace;background:#fff;color:#C8102E;border-radius:6px;padding:3px 6px")}>SOS</span>
                  {v.t.sosT}
                </button>
              </div>
            </>
          )}
          {v.isChat && (
            <>
              <div style={css("min-height:100%;display:flex;flex-direction:column")}>
                <div
                  style={css(
                    "position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:12px;padding:8px 16px 12px;background:#F4F1EA;border-bottom:1px solid rgba(22,24,29,.08)",
                  )}
                >
                  <div
                    style={css(
                      "width:42px;height:42px;border-radius:50%;background:#F2B33D;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px",
                    )}
                  >
                    MK
                  </div>
                  <div style={css("flex:1")}>
                    <div style={css("font-weight:700;font-size:16px")}>Marta Kowalska</div>
                    <div style={css("font-size:12px;color:#1F8A5B")}>{v.chatStatus}</div>
                  </div>
                  <button
                    onClick={v.callMarta}
                    style={css("height:38px;padding:0 12px;border:0;border-radius:10px;background:#fff;font:600 13px 'Onest';cursor:pointer;color:#16181D")}
                  >
                    {v.t.call}
                  </button>
                  <button
                    onClick={v.videoMarta}
                    style={css("height:38px;padding:0 12px;border:0;border-radius:10px;background:#fff;font:600 13px 'Onest';cursor:pointer;color:#16181D")}
                  >
                    {v.t.video}
                  </button>
                </div>
                <div style={css("flex:1;display:flex;flex-direction:column;gap:8px;padding:16px")}>
                  <div style={css("align-self:center;font:700 10px 'JetBrains Mono',monospace;color:#5E6068;letter-spacing:.06em")}>{v.t.todayUpper}</div>
                  {v.msgs.map((m, i_m) => (
                    <Fragment key={i_m}>
                      <div
                        style={css(
                          `max-width:80%;padding:10px 14px;border-radius:18px;font-size:15px;line-height:1.4;align-self:${m.align};background:${m.bg};color:${m.fg}`,
                        )}
                      >
                        {m.text}
                        <div style={css("font:500 10px 'JetBrains Mono',monospace;opacity:.6;margin-top:4px;text-align:right")}>{m.time}</div>
                      </div>
                    </Fragment>
                  ))}
                  {v.typing && (
                    <>
                      <div style={css("align-self:flex-start;padding:10px 14px;border-radius:18px;background:#fff;font-size:13px;color:#5E6068")}>
                        {"Marta "}
                        {v.t.typing}
                      </div>
                    </>
                  )}
                </div>
                {v.offline && (
                  <>
                    <div
                      style={css(
                        "position:sticky;bottom:66px;margin:0 12px 6px;background:#16181D;color:#fff;border-radius:12px;padding:8px 12px;font-size:12px;line-height:1.35",
                      )}
                    >
                      {v.t.offChat}
                    </div>
                  </>
                )}
                <div style={css("position:sticky;bottom:0;display:flex;gap:8px;padding:10px 12px;background:#F4F1EA;border-top:1px solid rgba(22,24,29,.08)")}>
                  <input
                    value={v.draft}
                    onChange={v.onDraft}
                    onKeyDown={v.onDraftKey}
                    placeholder={v.t.typeMsg}
                    style={css(
                      "flex:1;min-width:0;height:46px;border-radius:23px;border:1px solid rgba(22,24,29,.12);background:#fff;padding:0 16px;font-size:15px;outline:none;color:#16181D",
                    )}
                  />
                  <button
                    onClick={v.sendDraft}
                    style={css("height:46px;padding:0 18px;border:0;border-radius:23px;background:#16181D;color:#fff;font:700 14px 'Onest';cursor:pointer")}
                  >
                    {v.t.send}
                  </button>
                </div>
              </div>
            </>
          )}
          {v.isSos && (
            <>
              <div style={css("display:flow-root;padding:0 20px 28px;background:#C8102E;min-height:100%;color:#fff")}>
                <div style={css("font-size:15px;line-height:1.45;color:#FFE3E7;margin-top:4px")}>{v.t.sosSub}</div>
                <a
                  href="tel:112"
                  style={css(
                    "display:flex;align-items:center;gap:16px;margin-top:20px;background:#fff;color:#16181D;border-radius:22px;padding:18px;text-decoration:none",
                  )}
                >
                  <span style={css("font:800 30px 'JetBrains Mono',monospace;color:#C8102E")}>112</span>
                  <span>
                    <span style={css("display:block;font-weight:700;font-size:16px")}>{v.t.e112}</span>
                    <span style={css("display:block;font-size:13px;color:#5E6068;margin-top:2px")}>{v.t.e112s}</span>
                  </span>
                </a>
                <button
                  onClick={v.callMarta}
                  style={css(
                    "width:100%;display:flex;align-items:center;gap:14px;margin-top:10px;background:#16181D;color:#fff;border:0;border-radius:22px;padding:18px;text-align:left;cursor:pointer;font-family:'Onest'",
                  )}
                >
                  <span
                    style={css(
                      "width:48px;height:48px;border-radius:50%;background:#F2B33D;color:#16181D;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;flex:none",
                    )}
                  >
                    MK
                  </span>
                  <span>
                    <span style={css("display:block;font-weight:700;font-size:16px")}>{v.t.asst24}</span>
                    <span style={css("display:block;font-size:13px;color:#C9CBD1;margin-top:2px")}>Marta Kowalska · PL / IT</span>
                  </span>
                </button>
                <button
                  onClick={v.goDocs}
                  style={css(
                    "width:100%;display:flex;justify-content:space-between;align-items:center;margin-top:10px;background:#fff;color:#16181D;border:0;border-radius:22px;padding:16px 18px;text-align:left;cursor:pointer;font-family:'Onest'",
                  )}
                >
                  <span>
                    <span style={css("display:block;font-weight:700;font-size:16px")}>{v.t.theftT}</span>
                    <span style={css("display:block;font-size:13px;color:#5E6068;margin-top:2px")}>{v.t.vaultT}</span>
                  </span>
                  <span style={css("font:700 12px 'JetBrains Mono',monospace;color:#C8102E")}>DOC →</span>
                </button>
                <button
                  onClick={v.goProtect}
                  style={css(
                    "width:100%;display:flex;justify-content:space-between;align-items:center;margin-top:10px;background:#fff;color:#16181D;border:0;border-radius:22px;padding:16px 18px;text-align:left;cursor:pointer;font-family:'Onest'",
                  )}
                >
                  <span>
                    <span style={css("display:block;font-weight:700;font-size:16px")}>{v.t.alarmT}</span>
                    <span style={css("display:block;font-size:13px;color:#5E6068;margin-top:2px")}>{v.t.groupT}</span>
                  </span>
                  <span style={css("font:700 12px 'JetBrains Mono',monospace;color:#C8102E")}>ALR →</span>
                </button>
                <div style={css("margin-top:10px;background:rgba(255,255,255,.12);border-radius:22px;padding:18px")}>
                  <div style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#FFD0D7")}>{v.t.emb}</div>
                  <div style={css("font-weight:700;font-size:16px;margin-top:6px")}>Ambasada RP w Rzymie</div>
                  <div style={css("font-size:14px;color:#FFE3E7;margin-top:2px")}>Via Pietro Paolo Rubens, 20 · 00197 Roma</div>
                </div>
                <div style={css("margin-top:10px;background:rgba(255,255,255,.12);border-radius:22px;padding:18px")}>
                  <div style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#FFD0D7")}>{v.t.yourPos}</div>
                  <div style={css("font-weight:700;font-size:16px;margin-top:6px")}>Via Nazionale, 22 · Roma</div>
                  <button
                    onClick={v.shareLoc}
                    style={css(
                      "margin-top:12px;height:44px;padding:0 16px;border:0;border-radius:12px;background:#fff;color:#C8102E;font:700 14px 'Onest';cursor:pointer",
                    )}
                  >
                    {v.locLabel}
                  </button>
                </div>
              </div>
            </>
          )}
          {v.isHotel && (
            <>
              <div style={css("padding:4px 20px 28px")}>
                <div style={css("background:#fff;border-radius:22px;padding:20px;border:2px solid #16181D")}>
                  <div style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#C8102E")}>{v.t.showDriver}</div>
                  <div style={css("font-size:28px;font-weight:800;letter-spacing:-.02em;margin-top:10px;line-height:1.1")}>Hotel Artemide</div>
                  <div style={css("font-size:20px;font-weight:600;margin-top:6px;line-height:1.3")}>
                    Via Nazionale, 22
                    <br />
                    00184 Roma
                  </div>
                  <div style={css("font-size:15px;color:#4A4C54;margin-top:12px")}>«Mi porti a questo indirizzo, per favore.»</div>
                </div>
                <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px")}>
                  <div style={css("background:#fff;border-radius:16px;padding:14px")}>
                    <div style={css("font-size:12px;color:#5E6068")}>Check-in</div>
                    <div style={css("font:700 20px 'JetBrains Mono',monospace;margin-top:2px")}>14:00</div>
                  </div>
                  <div style={css("background:#fff;border-radius:16px;padding:14px")}>
                    <div style={css("font-size:12px;color:#5E6068")}>Check-out</div>
                    <div style={css("font:700 20px 'JetBrains Mono',monospace;margin-top:2px")}>11:00</div>
                  </div>
                </div>
                <div style={css("background:#fff;border-radius:16px;padding:14px 16px;margin-top:8px;font-size:14px;line-height:1.5;color:#4A4C54")}>
                  {v.t.hotelInfo}
                </div>
                <button
                  onClick={v.hotelProblem}
                  style={css(
                    "width:100%;margin-top:14px;height:54px;border:0;border-radius:16px;background:#16181D;color:#fff;font:700 15px 'Onest';cursor:pointer",
                  )}
                >
                  {v.t.hotelProblem}
                </button>
              </div>
            </>
          )}
          {v.isTransport && (
            <>
              <div style={css("padding:4px 20px 28px")}>
                <div style={css("background:#fff;border:2px solid #C8102E;border-radius:20px;padding:14px 16px;margin-bottom:12px")}>
                  <div style={css("font:700 10px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#C8102E")}>
                    {"● "}
                    {v.t.strikeTag}
                  </div>
                  <div style={css("font-size:15px;font-weight:800;margin-top:4px")}>{v.t.strikeTitle}</div>
                  <div style={css("font-size:13px;color:#33353C;margin-top:4px;line-height:1.4")}>{v.t.strikeSub}</div>
                  <div style={css("font-size:13px;color:#33353C;margin-top:6px;line-height:1.4")}>{v.t.strikeAlt}</div>
                  <div style={css("font-size:13px;margin-top:8px;line-height:1.4;background:#E4F4EB;color:#1E4D35;border-radius:10px;padding:8px 10px")}>
                    <b>✓</b> {v.t.strikeFix}
                  </div>
                </div>
                <div style={css("background:#16181D;color:#fff;border-radius:22px;padding:20px")}>
                  <div style={css("display:flex;justify-content:space-between;align-items:baseline")}>
                    <span style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#F2B33D")}>BIT · ATAC</span>
                    <span style={css("font:700 26px 'JetBrains Mono',monospace")}>1,50 €</span>
                  </div>
                  <div style={css("font-size:15px;margin-top:8px;color:#E3E4E8")}>{v.t.ticketSub}</div>
                  <div style={css("font-size:14px;margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.14);color:#C9CBD1;line-height:1.45")}>
                    {v.t.tap}
                  </div>
                </div>
                <div style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#5E6068;margin:22px 0 10px")}>{v.t.transportBuy}</div>
                <div style={css("background:#fff;border-radius:22px;padding:4px 16px")}>
                  {v.transitTickets.map((tt, i_tt) => (
                    <Fragment key={i_tt}>
                      <div style={css("display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(22,24,29,.07)")}>
                        <span style={css("font:700 12px 'JetBrains Mono',monospace;min-width:74px")}>{tt.name}</span>
                        <span style={css("flex:1;font-size:12px;color:#5E6068")}>{tt.valid}</span>
                        <button
                          onClick={tt.onClick}
                          style={css(
                            "height:38px;padding:0 12px;border:0;border-radius:10px;background:#16181D;color:#fff;font:700 13px 'JetBrains Mono',monospace;cursor:pointer",
                          )}
                        >
                          {tt.price}
                        </button>
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#5E6068;margin:22px 0 10px")}>{v.t.lines}</div>
                <div style={css("background:#fff;border-radius:22px;padding:4px 16px")}>
                  {v.lines.map((ln, i_ln) => (
                    <Fragment key={i_ln}>
                      <div style={css("display:flex;gap:12px;align-items:center;padding:13px 0;border-bottom:1px solid rgba(22,24,29,.07)")}>
                        <span
                          style={css(
                            `min-width:42px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font:700 13px 'JetBrains Mono',monospace;color:#fff;background:${ln.color}`,
                          )}
                        >
                          {ln.code}
                        </span>
                        <div>
                          <div style={css("font-size:14px;font-weight:600")}>{ln.route}</div>
                          <div style={css("font-size:12px;color:#5E6068;margin-top:2px")}>{ln.use}</div>
                        </div>
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div style={css("margin-top:12px;background:#FFF6DF;border-radius:16px;padding:14px 16px;font-size:14px;line-height:1.45;color:#4A3B12")}>
                  <b>{v.t.watch}</b> {v.t.pickpocket}
                </div>
              </div>
            </>
          )}
          {v.isTips && (
            <>
              <div style={css("padding:4px 20px 28px;display:flex;flex-direction:column;gap:8px")}>
                {v.tipList.map((tp, i_tp) => (
                  <Fragment key={i_tp}>
                    <div style={css("background:#fff;border-radius:18px;padding:16px;display:flex;gap:14px")}>
                      <span style={css("font:700 13px 'JetBrains Mono',monospace;color:#C8102E")}>{tp.n}</span>
                      <div>
                        <div style={css("font-size:15px;font-weight:700")}>{tp.title}</div>
                        <div style={css("font-size:13px;color:#4A4C54;margin-top:3px;line-height:1.45")}>{tp.body}</div>
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </>
          )}
          {v.isPhrases && (
            <>
              <div style={css("padding:4px 20px 28px;display:flex;flex-direction:column;gap:8px")}>
                <div style={css("font-size:14px;color:#5E6068;margin-bottom:4px")}>{v.t.phrasesSub}</div>
                {v.phraseList.map((ph, i_ph) => (
                  <Fragment key={i_ph}>
                    <button
                      onClick={ph.onClick}
                      style={css(
                        `border:0;text-align:left;cursor:pointer;border-radius:18px;padding:14px 16px;font-family:'Onest';background:${ph.bg};color:${ph.fg}`,
                      )}
                    >
                      <div style={css("font-size:13px;opacity:.75")}>{ph.pl}</div>
                      <div style={css(`font-weight:800;margin-top:3px;letter-spacing:-.01em;font-size:${ph.size}`)}>{ph.it}</div>
                      <div style={css("font:500 12px 'JetBrains Mono',monospace;opacity:.7;margin-top:4px")}>[{ph.say}]</div>
                    </button>
                  </Fragment>
                ))}
              </div>
            </>
          )}
          {v.isTrip && (
            <>
              <div style={css("padding:4px 20px 28px;display:flex;flex-direction:column;gap:10px")}>
                <div style={css("background:#16181D;color:#fff;border-radius:22px;padding:18px")}>
                  <div style={css("font:700 10px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#F2B33D")}>
                    {v.t.planBy}
                    {" · Wakacje z Rzymem"}
                  </div>
                  <div style={css("display:flex;gap:12px;align-items:center;margin-top:12px")}>
                    <span
                      style={css(
                        "width:42px;height:42px;flex:none;border-radius:50%;background:#1C5FB8;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px",
                      )}
                    >
                      EW
                    </span>
                    <div>
                      <div style={css("font-size:12px;color:#C9CBD1")}>{v.t.leader}</div>
                      <div style={css("font-weight:700;font-size:16px")}>Ewa Zielińska</div>
                    </div>
                  </div>
                  <div style={css("font-size:13px;color:#E3E4E8;margin-top:10px;line-height:1.45")}>{v.t.leaderSub}</div>
                  <button
                    onClick={v.goMapTab}
                    style={css(
                      "width:100%;margin-top:12px;height:44px;border:0;border-radius:12px;background:#F2B33D;color:#16181D;font:700 14px 'Onest';cursor:pointer",
                    )}
                  >
                    {v.t.followGroup}
                  </button>
                </div>
                {v.days.map((dy, i_dy) => (
                  <Fragment key={i_dy}>
                    <div style={css("background:#fff;border-radius:20px;padding:16px;border:1px solid rgba(22,24,29,.07)")}>
                      <div style={css("display:flex;justify-content:space-between;align-items:baseline")}>
                        <span style={css("font-weight:700;font-size:16px")}>{dy.title}</span>
                        <span style={css("font:700 12px 'JetBrains Mono',monospace;color:#5E6068")}>{dy.date}</span>
                      </div>
                      <div style={css("font-size:13px;color:#4A4C54;margin-top:6px;line-height:1.5")}>{dy.items}</div>
                    </div>
                  </Fragment>
                ))}
                <button
                  onClick={v.goChat}
                  style={css(
                    "height:50px;border:1.5px dashed #B9B2A3;border-radius:14px;background:transparent;font:600 14px 'Onest';color:#4A4C54;cursor:pointer",
                  )}
                >
                  {v.t.changePlan}
                </button>
              </div>
            </>
          )}
          {v.isMap && (
            <>
              <div style={css("position:relative;height:100%;overflow:hidden")}>
                <MapView ref={v.mapRef} route={v.routeOn} crowd={!v.crowdOff} pos={v.mapPos} />
                <div style={css("position:absolute;top:8px;left:12px;right:12px;display:flex;gap:8px;align-items:center;pointer-events:none")}>
                  <button
                    onClick={v.openCity}
                    style={css(
                      "pointer-events:auto;height:40px;padding:0 14px;border:0;border-radius:12px;background:#16181D;color:#fff;font:700 14px 'Onest';cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.2)",
                    )}
                  >
                    {v.t.cityRome}
                    {" ▾"}
                  </button>
                  <div
                    style={css(
                      "pointer-events:auto;flex:1;height:40px;border-radius:12px;background:#fff;display:flex;align-items:center;gap:8px;padding:0 12px;font-size:12px;color:#33353C;box-shadow:0 4px 12px rgba(0,0,0,.12)",
                    )}
                  >
                    <span style={css(`width:8px;height:8px;border-radius:50%;background:${v.locDot}`)}></span>
                    {v.mapLine}
                  </div>
                </div>
                <button
                  onClick={v.toggleCrowd}
                  style={css(
                    `position:absolute;left:12px;top:58px;height:44px;padding:0 12px;border-radius:12px;border:0;box-shadow:0 4px 12px rgba(0,0,0,.15);font:700 12px 'Onest';cursor:pointer;display:flex;align-items:center;gap:8px;background:${v.crowdBtnBg};color:${v.crowdBtnFg}`,
                  )}
                >
                  <span style={css("display:flex;gap:3px")}>
                    <span style={css("width:8px;height:8px;border-radius:50%;background:#C8102E")}></span>
                    <span style={css("width:8px;height:8px;border-radius:50%;background:#E0A21F")}></span>
                    <span style={css("width:8px;height:8px;border-radius:50%;background:#1F8A5B")}></span>
                  </span>
                  {v.t.crowdLayer}
                </button>
                <button
                  onClick={v.recenter}
                  style={css(
                    "position:absolute;right:12px;top:58px;width:44px;height:44px;border-radius:12px;border:0;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,.15);font:700 18px 'Onest';color:#1C5FB8;cursor:pointer",
                  )}
                >
                  ◎
                </button>
                <div
                  style={css(
                    "position:absolute;left:10px;right:10px;bottom:22px;background:#F4F1EA;border-radius:24px;padding:16px;box-shadow:0 10px 30px -8px rgba(0,0,0,.35)",
                  )}
                >
                  {v.noRoute && (
                    <>
                      <div style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#1C5FB8")}>{v.t.youAreHere}</div>
                      <div style={css("font-size:20px;font-weight:800;letter-spacing:-.02em;margin-top:4px")}>{v.placeName}</div>
                      <div style={css("font-size:13px;color:#5E6068;margin-top:2px")}>
                        {v.placeSub}
                      </div>
                      <button
                        onClick={v.startRoute}
                        style={css(
                          "width:100%;margin-top:14px;height:54px;border:0;border-radius:16px;background:#16181D;color:#fff;font:700 16px 'Onest';cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px",
                        )}
                      >
                        <span style={css("font:700 10px 'JetBrains Mono',monospace;background:#C8102E;border-radius:5px;padding:3px 6px")}>HTL</span>
                        {v.t.backHotel}
                      </button>
                      <button
                        onClick={v.lostHelp}
                        style={css(
                          "width:100%;margin-top:8px;height:46px;border:1px solid rgba(22,24,29,.15);border-radius:14px;background:#fff;font:600 14px 'Onest';color:#16181D;cursor:pointer",
                        )}
                      >
                        {v.t.lostBtn}
                      </button>
                    </>
                  )}
                  {v.routeOn && (
                    <>
                      <div style={css("display:flex;justify-content:space-between;align-items:baseline")}>
                        <span style={css("font-size:18px;font-weight:800")}>Hotel Artemide</span>
                        <span style={css("font:700 14px 'JetBrains Mono',monospace")}>{v.routeHead}</span>
                      </div>
                      {v.demoRoute && (<div style={css("display:flex;flex-direction:column;margin-top:10px;background:#fff;border-radius:16px;padding:2px 14px")}>
                        {v.routeSteps.map((rs, i_rs) => (
                          <Fragment key={i_rs}>
                            <div style={css("display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid rgba(22,24,29,.07)")}>
                              <span
                                style={css(
                                  `width:28px;height:28px;flex:none;border-radius:8px;display:flex;align-items:center;justify-content:center;font:700 14px 'Onest';background:${rs.bg};color:${rs.fg}`,
                                )}
                              >
                                {rs.arrow}
                              </span>
                              <span style={css(`flex:1;font-size:13px;font-weight:${rs.weight};line-height:1.3`)}>{rs.text}</span>
                              <span style={css("font:700 11px 'JetBrains Mono',monospace;color:#5E6068")}>{rs.dist}</span>
                            </div>
                          </Fragment>
                        ))}
                      </div>)}
                      <a
                        href={v.navHref}
                        target="_blank"
                        rel="noopener"
                        style={css("display:flex;align-items:center;justify-content:center;gap:8px;margin-top:10px;height:46px;border-radius:14px;background:#16181D;color:#fff;font:700 14px 'Onest';text-decoration:none")}
                      >
                        <span style={css("font:700 10px 'JetBrains Mono',monospace;background:#1C5FB8;border-radius:5px;padding:3px 6px")}>NAV</span>
                        {v.t.navOpen} ↗
                      </a>
                      <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px")}>
                        <button
                          onClick={v.goHotel}
                          style={css("height:46px;border:0;border-radius:14px;background:#F2B33D;color:#16181D;font:700 13px 'Onest';cursor:pointer")}
                        >
                          {v.t.taxiShow}
                        </button>
                        <button
                          onClick={v.endRoute}
                          style={css(
                            "height:46px;border:1px solid rgba(22,24,29,.15);border-radius:14px;background:#fff;color:#16181D;font:600 13px 'Onest';cursor:pointer",
                          )}
                        >
                          {v.t.endRoute}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
          {v.isDocs && (
            <>
              <div style={css("padding:4px 20px 28px")}>
                <div style={css("font-size:14px;color:#4A4C54;line-height:1.45")}>{v.t.vaultS}</div>
                {v.vaultLocked && (
                  <>
                    <div
                      style={css(
                        "margin-top:18px;background:#16181D;color:#fff;border-radius:24px;padding:28px 20px;display:flex;flex-direction:column;align-items:center;text-align:center",
                      )}
                    >
                      <div
                        style={css(
                          "width:64px;height:64px;border-radius:20px;border:2px solid #F2B33D;display:flex;align-items:center;justify-content:center;font:700 13px 'JetBrains Mono',monospace;color:#F2B33D",
                        )}
                      >
                        ID
                      </div>
                      <div style={css("font-size:18px;font-weight:700;margin-top:14px")}>{v.t.locked}</div>
                      <div style={css("font-size:13px;color:#C9CBD1;margin-top:4px")}>{v.t.lockedSub}</div>
                      <button
                        onClick={v.unlockVault}
                        style={css(
                          "margin-top:18px;height:50px;padding:0 24px;border:0;border-radius:14px;background:#F2B33D;color:#16181D;font:700 15px 'Onest';cursor:pointer",
                        )}
                      >
                        {v.unlockLabel}
                      </button>
                    </div>
                  </>
                )}
                {v.vaultOpen && (
                  <>
                    <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px")}>
                      {v.docList.map((dc, i_dc) => (
                        <Fragment key={i_dc}>
                          <label
                            style={css(
                              "display:flex;flex-direction:column;background:#fff;border-radius:18px;overflow:hidden;cursor:pointer;border:1px solid rgba(22,24,29,.08)",
                            )}
                          >
                            <input type="file" accept="image/*" capture="environment" onChange={dc.onFile} style={css("display:none")} />
                            <div
                              style={css(
                                `height:96px;display:flex;align-items:flex-end;padding:8px;font:500 10px 'JetBrains Mono',monospace;color:#5E6068;background:${dc.bg};background-size:cover;background-position:center`,
                              )}
                            >
                              {dc.hint}
                            </div>
                            <div style={css("padding:10px 12px")}>
                              <div style={css("font-size:14px;font-weight:700")}>{dc.label}</div>
                              <div style={css(`font:700 10px 'JetBrains Mono',monospace;margin-top:3px;color:${dc.stColor}`)}>{dc.st}</div>
                            </div>
                          </label>
                        </Fragment>
                      ))}
                    </div>
                    <div
                      style={css(
                        "display:flex;justify-content:space-between;align-items:center;margin-top:10px;background:#fff;border-radius:16px;padding:14px 16px",
                      )}
                    >
                      <div style={css("flex:1;padding-right:12px")}>
                        <div style={css("font-size:14px;font-weight:700")}>{v.t.shareOnce}</div>
                        <div style={css("font-size:12px;color:#5E6068;margin-top:2px;line-height:1.35")}>{v.shareDocsSub}</div>
                      </div>
                      <button
                        onClick={v.toggleShareDocs}
                        style={css(
                          `width:52px;height:32px;flex:none;border-radius:16px;border:0;padding:3px;cursor:pointer;display:flex;background:${v.shareDocsBg};justify-content:${v.shareDocsJust}`,
                        )}
                      >
                        <span style={css("width:26px;height:26px;border-radius:50%;background:#fff")}></span>
                      </button>
                    </div>
                    <button
                      onClick={v.lockVault}
                      style={css("margin-top:8px;border:0;background:none;padding:6px 0;font:600 13px 'Onest';color:#5E6068;cursor:pointer")}
                    >
                      {v.t.lock}
                    </button>
                  </>
                )}
                <div style={css("margin-top:18px;background:#FDECEF;border:1.5px solid #C8102E;border-radius:22px;padding:18px")}>
                  <div style={css("font-size:17px;font-weight:800;color:#8E0B21")}>{v.t.theftT}</div>
                  <div style={css("display:flex;flex-direction:column;gap:10px;margin-top:12px")}>
                    {v.theftSteps.map((ts, i_ts) => (
                      <Fragment key={i_ts}>
                        <div style={css("display:flex;gap:12px;font-size:13px;line-height:1.4;color:#33353C")}>
                          <span style={css("font:700 12px 'JetBrains Mono',monospace;color:#C8102E")}>{ts.n}</span>
                          {ts.text}
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  <button
                    onClick={v.reportTheft}
                    style={css(
                      "width:100%;margin-top:14px;height:50px;border:0;border-radius:14px;background:#C8102E;color:#fff;font:700 15px 'Onest';cursor:pointer",
                    )}
                  >
                    {v.t.reportTheft}
                  </button>
                </div>
              </div>
            </>
          )}
          {v.isPrivacy && (
            <>
              <div style={css("padding:4px 20px 28px")}>
                <div style={css("font-size:14px;color:#4A4C54;line-height:1.45")}>{v.t.privS}</div>
                <div style={css("margin-top:16px;background:#fff;border-radius:20px;padding:16px 18px")}>
                  <div style={css("font-weight:700;font-size:15px")}>{v.t.locTitle}</div>
                  <div style={css("font-size:13px;color:#5E6068;margin-top:3px;line-height:1.4")}>{v.t.locSub}</div>
                  <div style={css("display:flex;gap:2px;background:#F4F1EA;border-radius:12px;padding:3px;margin-top:12px")}>
                    {v.locOpts.map((lo, i_lo) => (
                      <Fragment key={i_lo}>
                        <button
                          onClick={lo.onClick}
                          style={css(`flex:1;border:0;border-radius:10px;height:38px;font:600 12px 'Onest';cursor:pointer;background:${lo.bg};color:${lo.fg}`)}
                        >
                          {lo.label}
                        </button>
                      </Fragment>
                    ))}
                  </div>
                </div>
                <div style={css("margin-top:8px;background:#fff;border-radius:20px;padding:4px 18px")}>
                  {v.privRows.map((pr, i_pr) => (
                    <Fragment key={i_pr}>
                      <div
                        style={css(
                          "display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid rgba(22,24,29,.07)",
                        )}
                      >
                        <div style={css("flex:1")}>
                          <div style={css("font-size:14px;font-weight:700")}>{pr.title}</div>
                          <div style={css("font-size:12px;color:#5E6068;margin-top:2px;line-height:1.35")}>{pr.sub}</div>
                        </div>
                        <button
                          onClick={pr.onClick}
                          style={css(
                            `width:52px;height:32px;flex:none;border-radius:16px;border:0;padding:3px;cursor:pointer;display:flex;background:${pr.bg};justify-content:${pr.just}`,
                          )}
                        >
                          <span style={css("width:26px;height:26px;border-radius:50%;background:#fff")}></span>
                        </button>
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div style={css("margin-top:8px;background:#fff;border-radius:20px;padding:4px 18px")}>
                  <button
                    onClick={v.exportData}
                    style={css(
                      "width:100%;display:flex;justify-content:space-between;align-items:center;padding:15px 0;border:0;border-bottom:1px solid rgba(22,24,29,.07);background:none;cursor:pointer;font:600 14px 'Onest';color:#16181D",
                    )}
                  >
                    <span>{v.t.download}</span>
                    <span style={css("font:700 11px 'JetBrains Mono',monospace;color:#1F8A5B")}>{v.exportLabel}</span>
                  </button>
                  <button
                    onClick={v.goChat}
                    style={css(
                      "width:100%;display:flex;justify-content:space-between;align-items:center;padding:15px 0;border:0;border-bottom:1px solid rgba(22,24,29,.07);background:none;cursor:pointer;font:600 14px 'Onest';color:#16181D",
                    )}
                  >
                    <span>{v.t.dpo}</span>
                    <span style={css("color:#5E6068")}>→</span>
                  </button>
                  <button
                    onClick={v.askDelete}
                    style={css(
                      "width:100%;display:flex;justify-content:space-between;align-items:center;padding:15px 0;border:0;background:none;cursor:pointer;font:600 14px 'Onest';color:#C8102E",
                    )}
                  >
                    <span>{v.deleteLabel}</span>
                    <span>→</span>
                  </button>
                </div>
                <div style={css("font-size:12px;color:#5E6068;line-height:1.5;margin-top:14px")}>{v.t.legal}</div>
              </div>
            </>
          )}
          {v.isProtect && (
            <>
              <div style={css("padding:4px 20px 28px")}>
                <div style={css("background:#16181D;color:#fff;border-radius:24px;padding:20px")}>
                  <div style={css("display:flex;justify-content:space-between;align-items:center")}>
                    <span style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#F2B33D")}>
                      {"ALR · "}
                      {v.t.alarmTag}
                    </span>
                    <span style={css(`font:700 11px 'JetBrains Mono',monospace;color:${v.armColor}`)}>{v.armState}</span>
                  </div>
                  <div style={css("font-size:21px;font-weight:800;margin-top:8px;letter-spacing:-.02em")}>{v.t.alarmT}</div>
                  <div style={css("font-size:13px;color:#C9CBD1;margin-top:4px;line-height:1.45")}>{v.t.alarmS}</div>
                  <div style={css("display:flex;gap:2px;background:rgba(255,255,255,.1);border-radius:12px;padding:3px;margin-top:14px")}>
                    {v.alarmModes.map((am, i_am) => (
                      <Fragment key={i_am}>
                        <button
                          onClick={am.onClick}
                          style={css(`flex:1;border:0;border-radius:10px;height:40px;font:600 12px 'Onest';cursor:pointer;background:${am.bg};color:${am.fg}`)}
                        >
                          {am.label}
                        </button>
                      </Fragment>
                    ))}
                  </div>
                  <div style={css("font-size:13px;color:#E3E4E8;margin-top:10px;line-height:1.45")}>{v.alarmModeText}</div>
                  {v.watchMode && (
                    <>
                      <div style={css("display:flex;gap:6px;margin-top:10px")}>
                        {v.distOpts.map((dz, i_dz) => (
                          <Fragment key={i_dz}>
                            <button
                              onClick={dz.onClick}
                              style={css(
                                `flex:1;height:40px;border-radius:10px;font:700 13px 'JetBrains Mono',monospace;cursor:pointer;background:${dz.bg};color:${dz.fg};border:${dz.border}`,
                              )}
                            >
                              {dz.label}
                            </button>
                          </Fragment>
                        ))}
                      </div>
                    </>
                  )}
                  <button
                    onClick={v.toggleArm}
                    style={css(
                      `width:100%;margin-top:16px;height:54px;border:0;border-radius:16px;font:700 16px 'Onest';cursor:pointer;background:${v.armBtnBg};color:${v.armBtnFg}`,
                    )}
                  >
                    {v.armBtnLabel}
                  </button>
                  <button
                    onClick={v.simTheft}
                    style={css(
                      "width:100%;margin-top:8px;height:42px;border:1.5px dashed rgba(255,255,255,.3);border-radius:12px;background:transparent;color:#C9CBD1;font:600 13px 'Onest';cursor:pointer",
                    )}
                  >
                    {v.t.simTheft}
                  </button>
                </div>
                <div style={css("margin-top:12px;background:#fff;border-radius:24px;padding:18px;border:1px solid rgba(22,24,29,.07)")}>
                  <div style={css("display:flex;justify-content:space-between;align-items:center;gap:12px")}>
                    <div style={css("flex:1")}>
                      <div style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#1C5FB8")}>
                        {"GRP · "}
                        {v.t.groupTag}
                      </div>
                      <div style={css("font-size:19px;font-weight:800;margin-top:6px;letter-spacing:-.02em")}>{v.t.groupT}</div>
                    </div>
                    <button
                      onClick={v.toggleGroup}
                      style={css(
                        `width:52px;height:32px;flex:none;border-radius:16px;border:0;padding:3px;cursor:pointer;display:flex;background:${v.groupBg};justify-content:${v.groupJust}`,
                      )}
                    >
                      <span style={css("width:26px;height:26px;border-radius:50%;background:#fff")}></span>
                    </button>
                  </div>
                  <div style={css("font-size:13px;color:#4A4C54;margin-top:4px;line-height:1.45")}>{v.t.groupS}</div>
                  <div style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.06em;color:#5E6068;margin:14px 0 6px")}>{v.t.groupRadius}</div>
                  <div style={css("display:flex;gap:6px")}>
                    {v.radiusOpts.map((ro, i_ro) => (
                      <Fragment key={i_ro}>
                        <button
                          onClick={ro.onClick}
                          style={css(
                            `flex:1;height:40px;border-radius:10px;font:700 13px 'JetBrains Mono',monospace;cursor:pointer;background:${ro.bg};color:${ro.fg};border:${ro.border}`,
                          )}
                        >
                          {ro.label}
                        </button>
                      </Fragment>
                    ))}
                  </div>
                  <div style={css("margin-top:14px;background:#F4F1EA;border-radius:16px;padding:4px 14px")}>
                    {v.groupMembers.map((gm, i_gm) => (
                      <Fragment key={i_gm}>
                        <div style={css("display:flex;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid rgba(22,24,29,.07)")}>
                          <span
                            style={css(
                              `width:34px;height:34px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;background:${gm.bg};color:${gm.fg}`,
                            )}
                          >
                            {gm.ini}
                          </span>
                          <span style={css("flex:1")}>
                            <span style={css("display:block;font-size:14px;font-weight:700")}>{gm.name}</span>
                            <span style={css("display:block;font-size:12px;color:#5E6068")}>{gm.role}</span>
                          </span>
                          <span style={css(`font:700 12px 'JetBrains Mono',monospace;color:${gm.distColor}`)}>{gm.dist}</span>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  <button
                    onClick={v.simGroup}
                    style={css(
                      "width:100%;margin-top:12px;height:42px;border:1.5px dashed #B9B2A3;border-radius:12px;background:transparent;color:#4A4C54;font:600 13px 'Onest';cursor:pointer",
                    )}
                  >
                    {v.t.simGroup}
                  </button>
                </div>
                <div style={css("font-size:12px;color:#5E6068;line-height:1.5;margin-top:14px")}>{v.t.protectPriv}</div>
              </div>
            </>
          )}
          {v.isTickets && (
            <>
              <div style={css("padding:4px 20px 28px;display:flex;flex-direction:column;gap:10px")}>
                <div style={css("font-size:14px;color:#4A4C54;line-height:1.45")}>{v.t.ticketsSub}</div>
                {v.ticketList.map((tk, i_tk) => (
                  <Fragment key={i_tk}>
                    <div style={css("background:#fff;border-radius:22px;overflow:hidden;border:1px solid rgba(22,24,29,.08)")}>
                      <button
                        onClick={tk.onClick}
                        style={css(
                          "width:100%;border:0;background:#16181D;color:#fff;padding:14px 16px;text-align:left;cursor:pointer;display:flex;gap:12px;align-items:center;font-family:'Onest'",
                        )}
                      >
                        <span style={css("font:700 12px 'JetBrains Mono',monospace;color:#F2B33D;min-width:34px")}>{tk.kind}</span>
                        <span style={css("flex:1")}>
                          <span style={css("display:block;font-weight:700;font-size:15px;line-height:1.25")}>{tk.title}</span>
                          <span style={css("display:block;font-size:12px;color:#C9CBD1;margin-top:3px")}>{tk.sub}</span>
                        </span>
                        <span style={css(`font:700 9px 'JetBrains Mono',monospace;border-radius:5px;padding:3px 5px;background:${tk.badgeBg};color:#16181D`)}>
                          {tk.badge}
                        </span>
                      </button>
                      <div
                        style={css(
                          "display:flex;justify-content:space-between;padding:10px 16px;font:700 12px 'JetBrains Mono',monospace;border-top:2px dashed #E4DFD4",
                        )}
                      >
                        <span>{tk.code}</span>
                        <span style={css("color:#C8102E")}>{tk.toggle}</span>
                      </div>
                      {tk.open && (
                        <>
                          <div style={css("padding:4px 16px 16px;display:flex;flex-direction:column;align-items:center")}>
                            <div
                              style={css(
                                "display:grid;grid-template-columns:repeat(25,8px);gap:0;padding:12px;background:#fff;border:1px solid rgba(22,24,29,.1);border-radius:12px",
                              )}
                            >
                              {v.qrCells.map((q, i_q) => (
                                <Fragment key={i_q}>
                                  <span style={css(`width:8px;height:8px;background:${q}`)}></span>
                                </Fragment>
                              ))}
                            </div>
                            <div style={css("font-size:12px;color:#5E6068;margin-top:8px")}>{v.t.showQr}</div>
                            <button
                              style={css(
                                "margin-top:10px;height:44px;padding:0 18px;border:0;border-radius:12px;background:#000;color:#fff;font:600 14px 'Onest';cursor:pointer",
                              )}
                            >
                              {v.t.addWallet}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </Fragment>
                ))}
              </div>
            </>
          )}
        </div>
        {v.showTabs && (
          <>
            <div
              data-guide="tabs"
              style={css(
                "position:absolute;left:0;right:0;bottom:0;height:calc(64px + var(--sab));background:#fff;border-top:1px solid rgba(22,24,29,.08);display:grid;grid-template-columns:repeat(5,1fr);padding:8px 6px 0;z-index:20",
              )}
            >
              {v.tabs.map((tb, i_tb) => (
                <Fragment key={i_tb}>
                  <button
                    onClick={tb.onClick}
                    style={css(
                      `border:0;background:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px;padding-top:4px;color:${tb.fg}`,
                    )}
                  >
                    <span
                      style={css(
                        `height:28px;min-width:44px;padding:0 8px;border-radius:9px;display:flex;align-items:center;justify-content:center;font:700 11px 'JetBrains Mono',monospace;background:${tb.bg};color:${tb.iconFg}`,
                      )}
                    >
                      {tb.code}
                    </span>
                    <span style={css("font-size:11px;font-weight:600")}>{tb.label}</span>
                  </button>
                </Fragment>
              ))}
            </div>
          </>
        )}
        {v.pushOn && (
          <>
            <div
              onClick={v.hidePush}
              style={css(
                "position:absolute;top:calc(var(--sat) + 8px);left:10px;right:10px;z-index:35;background:rgba(250,249,246,.97);border-radius:22px;padding:12px 14px;display:flex;gap:12px;align-items:flex-start;box-shadow:0 12px 30px rgba(0,0,0,.28);cursor:pointer",
              )}
            >
              <div
                style={css(
                  "width:38px;height:38px;flex:none;border-radius:10px;background:#16181D;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px",
                )}
              >
                r<span style={css("color:#C8102E")}>.</span>
              </div>
              <div style={css("flex:1")}>
                <div style={css("display:flex;justify-content:space-between;font-size:12px;color:#5E6068")}>
                  <span style={css("font-weight:700;color:#16181D")}>Razem</span>
                  <span>{v.t.now}</span>
                </div>
                <div style={css("font-size:14px;font-weight:700;margin-top:2px")}>{v.t.pushTitle}</div>
                <div style={css("font-size:13px;color:#33353C;margin-top:1px;line-height:1.35")}>{v.t.pushBody}</div>
              </div>
            </div>
          </>
        )}
        {v.payOpen && (
          <>
            <div style={css("position:absolute;inset:0;background:rgba(12,13,16,.5);z-index:48;display:flex;align-items:flex-end")}>
              <div style={css("width:100%;background:#fff;border-radius:28px 28px 0 0;padding:14px 20px calc(24px + var(--sab))")}>
                <div style={css("width:40px;height:5px;border-radius:3px;background:#CFC9BC;margin:0 auto 16px")}></div>
                <div style={css("font:700 10px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#5E6068")}>{v.t.payTotal}</div>
                <div style={css("display:flex;justify-content:space-between;align-items:baseline;margin-top:4px")}>
                  <span style={css("font-size:17px;font-weight:700;flex:1;padding-right:12px;line-height:1.25")}>{v.payTitle}</span>
                  <span style={css("font:700 24px 'JetBrains Mono',monospace")}>{v.payPrice}</span>
                </div>
                <div style={css("font-size:13px;color:#5E6068;margin-top:4px")}>{v.paySub}</div>
                <div
                  style={css(
                    "display:flex;gap:10px;align-items:center;margin-top:16px;padding:12px 14px;background:#F4F1EA;border-radius:14px;font-size:13px;color:#33353C",
                  )}
                >
                  <span style={css("font:700 11px 'JetBrains Mono',monospace;background:#16181D;color:#fff;border-radius:6px;padding:4px 6px")}>PAY</span>
                  {v.t.payWith}
                </div>
                <button
                  onClick={v.confirmPay}
                  style={css(
                    "width:100%;margin-top:14px;height:56px;border:0;border-radius:16px;background:#000;color:#fff;font:700 16px 'Onest';cursor:pointer",
                  )}
                >
                  {v.payBtn}
                </button>
                <button
                  onClick={v.closePay}
                  style={css("width:100%;margin-top:6px;height:44px;border:0;background:none;font:600 14px 'Onest';color:#5E6068;cursor:pointer")}
                >
                  {v.t.cancel}
                </button>
              </div>
            </div>
          </>
        )}
        {v.toastOn && (
          <>
            <div
              onClick={v.goTickets}
              style={css(
                "position:absolute;left:20px;right:20px;bottom:calc(84px + var(--sab));z-index:47;background:#1F8A5B;color:#fff;border-radius:16px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:14px;cursor:pointer;box-shadow:0 10px 24px rgba(0,0,0,.25)",
              )}
            >
              <span>
                {"✓ "}
                {v.t.added}
              </span>
              <span style={css("font:700 11px 'JetBrains Mono',monospace")}>BLT →</span>
            </div>
          </>
        )}
        {v.citySheet && (
          <>
            <div onClick={v.closeCity} style={css("position:absolute;inset:0;background:rgba(12,13,16,.45);z-index:40;display:flex;align-items:flex-end")}>
              <div style={css("width:100%;background:#F4F1EA;border-radius:28px 28px 0 0;padding:14px 20px calc(24px + var(--sab))")}>
                <div style={css("width:40px;height:5px;border-radius:3px;background:#CFC9BC;margin:0 auto 16px")}></div>
                <div style={css("font-size:20px;font-weight:800")}>{v.t.cityTitle}</div>
                <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px")}>
                  {v.cityCards.map((cc, i_cc) => (
                    <Fragment key={i_cc}>
                      <div
                        style={css(
                          `height:150px;border-radius:18px;overflow:hidden;position:relative;display:flex;flex-direction:column;justify-content:space-between;padding:10px 12px;color:#fff;background:${cc.img};background-color:#DCD6C9`,
                        )}
                      >
                        <span
                          style={css(
                            `align-self:flex-start;font:700 10px 'JetBrains Mono',monospace;border-radius:6px;padding:3px 6px;background:${cc.badgeBg};color:${cc.badgeFg}`,
                          )}
                        >
                          {cc.badge}
                        </span>
                        <span style={css("font-size:18px;font-weight:800;text-shadow:0 1px 6px rgba(0,0,0,.8)")}>{cc.name}</span>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
        {v.isCalling && (
          <>
            <div
              style={css(
                "position:absolute;inset:0;background:#0C0D10;z-index:50;display:flex;flex-direction:column;align-items:center;padding:calc(var(--sat) + 100px) 30px calc(40px + var(--sab));color:#fff",
              )}
            >
              <div style={css("position:relative;width:120px;height:120px")}>
                {v.pulseEl}
                <div
                  style={css(
                    "position:absolute;inset:0;border-radius:50%;background:#F2B33D;color:#16181D;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:36px",
                  )}
                >
                  {v.callInitials}
                </div>
              </div>
              <div style={css("font-size:26px;font-weight:700;margin-top:28px")}>{v.callName}</div>
              <div style={css("font-size:15px;color:#C9CBD1;margin-top:6px")}>{v.callStatus}</div>
              <div style={css("flex:1")}></div>
              <button
                onClick={v.endCall}
                style={css("width:72px;height:72px;border-radius:50%;border:0;background:#C8102E;color:#fff;font:700 13px 'Onest';cursor:pointer")}
              >
                {v.t.end}
              </button>
            </div>
          </>
        )}
        {v.guide && (
          <>
            <div style={css("position:absolute;inset:0;background:rgba(12,13,16,.5);z-index:45;display:flex;align-items:flex-end")}>
              <div
                style={css(
                  "width:100%;max-height:calc(100% - var(--sat) - 20px);overflow-y:auto;background:#F4F1EA;border-radius:28px 28px 0 0;padding:14px 20px calc(36px + var(--sab));scrollbar-width:none",
                )}
              >
                <div style={css("display:flex;justify-content:space-between;align-items:center")}>
                  <div style={css("width:40px")}></div>
                  <div style={css("width:40px;height:5px;border-radius:3px;background:#CFC9BC")}></div>
                  <button
                    onClick={v.closeGuide}
                    style={css("width:40px;height:40px;border-radius:12px;border:0;background:#fff;font:600 16px 'Onest';cursor:pointer;color:#16181D")}
                  >
                    ✕
                  </button>
                </div>
                <div style={css("font-size:26px;font-weight:800;letter-spacing:-.03em;margin-top:6px")}>{v.t.guideT}</div>
                <div style={css("font-size:14px;color:#4A4C54;margin-top:4px;line-height:1.45")}>{v.t.guideS}</div>
                <div style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#5E6068;margin:18px 0 8px")}>{v.t.gLang}</div>
                <div style={css("display:grid;grid-template-columns:repeat(3,1fr);gap:6px")}>
                  {v.bigLangs.map((bl, i_bl) => (
                    <Fragment key={i_bl}>
                      <button
                        onClick={bl.onClick}
                        style={css(
                          `height:56px;border-radius:14px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:${bl.bg};color:${bl.fg};border:${bl.border}`,
                        )}
                      >
                        <span style={css("font:700 13px 'JetBrains Mono',monospace")}>{bl.code}</span>
                        <span style={css("font:500 12px 'Onest'")}>{bl.name}</span>
                      </button>
                    </Fragment>
                  ))}
                </div>
                <button
                  onClick={v.startTour}
                  style={css(
                    "width:100%;margin-top:16px;height:56px;border:0;border-radius:16px;background:#16181D;color:#fff;font:700 16px 'Onest';cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px",
                  )}
                >
                  <span style={css("width:22px;height:22px;border-radius:50%;border:2px solid #F2B33D;display:flex;align-items:center;justify-content:center")}>
                    <span style={css("width:8px;height:8px;border-radius:50%;background:#F2B33D")}></span>
                  </span>
                  {v.t.showMe}
                </button>
                <div style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em;color:#5E6068;margin:22px 0 8px")}>{v.t.gWhat}</div>
                <div style={css("display:flex;flex-direction:column;gap:6px")}>
                  {v.guideItems.map((gi, i_gi) => (
                    <Fragment key={i_gi}>
                      <button
                        onClick={gi.onClick}
                        style={css(
                          "display:flex;gap:12px;align-items:flex-start;text-align:left;border:0;background:#fff;border-radius:16px;padding:12px 14px;cursor:pointer;font-family:'Onest';color:#16181D",
                        )}
                      >
                        <span
                          style={css(
                            `width:44px;height:36px;flex:none;border-radius:10px;border:1px solid rgba(22,24,29,.1);display:flex;align-items:center;justify-content:center;font:700 11px 'JetBrains Mono',monospace;color:${gi.fg}`,
                          )}
                        >
                          {gi.code}
                        </span>
                        <span style={css("flex:1")}>
                          <span style={css("display:block;font-weight:700;font-size:14px")}>{gi.title}</span>
                          <span style={css("display:block;font-size:12px;color:#4A4C54;margin-top:2px;line-height:1.4")}>{gi.desc}</span>
                        </span>
                        <span style={css("color:#5E6068;padding-top:8px")}>→</span>
                      </button>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
        {v.alarmOn && (
          <>
            <div
              style={css(
                "position:absolute;inset:0;z-index:70;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 28px;color:#fff;text-align:center",
              )}
            >
              {"\n"}
              {v.flashEl}
              {"\n"}
              <div style={css("position:relative;font:800 64px 'JetBrains Mono',monospace;letter-spacing:.04em")}>ALARM</div>
              <div style={css("position:relative;font-size:22px;font-weight:800;margin-top:10px;text-wrap:balance")}>{v.t.alarmFired}</div>
              <div style={css("position:relative;font-size:15px;margin-top:10px;line-height:1.45;opacity:.9")}>{v.t.alarmFiredSub}</div>
              <button
                onClick={v.disarm}
                style={css(
                  "position:relative;margin-top:36px;height:60px;padding:0 28px;border:0;border-radius:18px;background:#fff;color:#16181D;font:800 17px 'Onest';cursor:pointer",
                )}
              >
                {v.t.disarm}
              </button>
            </div>
          </>
        )}
        {v.groupOn && (
          <>
            <div style={css("position:absolute;inset:0;z-index:65;background:rgba(12,13,16,.6);display:flex;align-items:flex-end")}>
              <div style={css("width:100%;background:#F2B33D;border-radius:28px 28px 0 0;padding:22px 20px calc(24px + var(--sab));color:#16181D")}>
                <div style={css("font:700 11px 'JetBrains Mono',monospace;letter-spacing:.08em")}>
                  {"GRP · "}
                  {v.t.groupTag}
                </div>
                <div style={css("font-size:26px;font-weight:800;letter-spacing:-.03em;margin-top:8px")}>{v.t.groupLost}</div>
                <div style={css("font-size:15px;margin-top:6px;line-height:1.45")}>{v.t.groupLostSub}</div>
                <div style={css("display:flex;flex-direction:column;gap:8px;margin-top:18px")}>
                  <button
                    onClick={v.callGuide}
                    style={css("height:54px;border:0;border-radius:16px;background:#16181D;color:#fff;font:700 16px 'Onest';cursor:pointer")}
                  >
                    {v.t.callGuide}
                  </button>
                  <button
                    onClick={v.groupToMap}
                    style={css("height:50px;border:0;border-radius:16px;background:#fff;color:#16181D;font:700 15px 'Onest';cursor:pointer")}
                  >
                    {v.t.showGroup}
                  </button>
                  <button
                    onClick={v.groupOk}
                    style={css(
                      "height:46px;border:1.5px solid #16181D;border-radius:16px;background:transparent;color:#16181D;font:600 14px 'Onest';cursor:pointer",
                    )}
                  >
                    {v.t.groupOkBtn}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        {v.touring && (
          <>
            <div style={css("position:absolute;inset:0;z-index:55")}>
              <div
                style={css(
                  `position:absolute;border-radius:18px;border:2px solid #F2B33D;box-shadow:0 0 0 9999px rgba(12,13,16,.74);transition:all .3s ease;left:${v.hlX};top:${v.hlY};width:${v.hlW};height:${v.hlH}`,
                )}
              ></div>
              {"\n"}
              {v.tapEl}
              {"\n"}
              <div
                style={css(
                  `position:absolute;left:16px;right:16px;background:#fff;border-radius:20px;padding:16px 18px;box-shadow:0 12px 30px rgba(0,0,0,.3);top:${v.tipTop};bottom:${v.tipBottom}`,
                )}
              >
                <div style={css("display:flex;justify-content:space-between;font:700 11px 'JetBrains Mono',monospace;letter-spacing:.06em;color:#C8102E")}>
                  <span>{v.tourCount}</span>
                  <span style={css("color:#5E6068")}>{v.t.tapHere}</span>
                </div>
                <div style={css("font-size:18px;font-weight:800;margin-top:6px")}>{v.tourTitle}</div>
                <div style={css("font-size:14px;color:#4A4C54;margin-top:4px;line-height:1.45")}>{v.tourText}</div>
                <div style={css("display:flex;gap:8px;margin-top:14px")}>
                  <button
                    onClick={v.endTour}
                    style={css(
                      "height:44px;padding:0 16px;border:1px solid rgba(22,24,29,.15);border-radius:12px;background:#fff;font:600 14px 'Onest';cursor:pointer;color:#16181D",
                    )}
                  >
                    {v.t.skip}
                  </button>
                  <button
                    onClick={v.nextTour}
                    style={css("flex:1;height:44px;border:0;border-radius:12px;background:#16181D;color:#fff;font:700 14px 'Onest';cursor:pointer")}
                  >
                    {v.nextTourLabel}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        
      </div>
    </>
  );
}
