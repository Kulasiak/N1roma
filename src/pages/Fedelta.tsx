/** Programma fedeltà: punti, livelli, premi, riscatti. */

import { useMemo, useState } from 'react'
import { Gift, Pencil, Plus, Sparkles, Star, Trash, TrendingUp, Users } from 'lucide-react'
import { useSalon } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { cardUrl, loyaltySummary, topMembers } from '@/lib/loyalty'
import { LOYALTY_TIERS, type Reward } from '@/lib/types'
import { cn, fullName, pct } from '@/lib/utils'
import { StatCard } from '@/components/StatCard'
import { LoyaltyCard } from '@/components/LoyaltyCard'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import {
  Avatar, Badge, Button, Card, CardHeader, EmptyState, Field, Input, Modal, Progress, Switch, Textarea,
} from '@/components/ui'
import { PageHeader } from '@/components/Shell'

const EMPTY: Omit<Reward, 'id'> = { name: '', description: '', cost: 200, active: true }

export function Fedelta() {
  const { state, dispatch } = useSalon()
  const { t } = useI18n()
  const [editing, setEditing] = useState<Reward | 'new' | null>(null)
  const [redeemFor, setRedeemFor] = useState<string | null>(null)

  const summary = useMemo(() => loyaltySummary(state), [state])
  const members = useMemo(() => topMembers(state, 10), [state])
  const maxTier = Math.max(1, ...summary.byTier.map((b) => b.count))
  const redeemClient = redeemFor ? state.clients.find((c) => c.id === redeemFor) : null
  const showcase = members[0]?.client ?? state.clients[0]

  return (
    <>
      <PageHeader
        title={t('nav.loyalty')}
        description={t('loy.subtitle', { n: summary.members, points: summary.outstanding })}
        actions={<Button variant="accent" onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" />{t('loy.newReward')}</Button>}
      />

      {!state.settings.loyalty.enabled && (
        <Card className="border-accent/40 bg-accent/10 mb-5 flex flex-wrap items-center gap-3 p-4">
          <span className="bg-accent grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold">{t('loy.disabled')}</p>
            <p className="text-soft text-[12px]">{t('loy.disabledDesc')}</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label={t('loy.kpiMembers')} value={String(summary.members)} icon={<Users className="h-4 w-4" />} />
        <StatCard index={1} label={t('loy.kpiIssued')} value={String(summary.issued)} icon={<Star className="h-4 w-4" />} />
        <StatCard index={2} label={t('loy.kpiRedeemed')} value={String(summary.redeemed)} icon={<Gift className="h-4 w-4" />} />
        <StatCard index={3} label={t('loy.kpiRate')} value={pct(summary.redemptionRate)} icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5">
          {showcase && (
            <Card className="p-5">
              <p className="text-mute mb-1 text-[11px] font-bold tracking-wide uppercase">{t('loy.cardTitle')}</p>
              <p className="text-mute mb-4 text-[12px]">{t('loy.cardHint')}</p>
              <LoyaltyCard client={showcase} />
            </Card>
          )}

          <Card>
            <CardHeader title={t('loy.tiersTitle')} subtitle={t('loy.tiersSub')} />
            <div className="space-y-3.5 p-5 pt-4">
              {summary.byTier.map(({ tier, count }) => (
                <div key={tier.id}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="flex items-center gap-2 text-[13px] font-semibold">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: tier.tint }} aria-hidden="true" />
                      {t(`tier.${tier.id}` as never)}
                      <span className="text-mute font-medium">{t('loy.tierFrom', { n: tier.min })}</span>
                    </span>
                    <span className="text-[13px] font-bold tabular-nums">{count}</span>
                  </div>
                  <Progress value={(count / maxTier) * 100} color={tier.tint} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="xl:col-span-2">
          <CardHeader title={t('loy.rewardsTitle')} subtitle={t('loy.rewardsSub')} />
          {state.rewards.length === 0 ? (
            <EmptyState icon={<Gift className="h-6 w-6" />}
              title={t('loy.emptyRewards')} description={t('loy.emptyRewardsDesc')}
              action={<Button variant="primary" onClick={() => setEditing('new')}>
                <Plus className="h-4 w-4" />{t('loy.newReward')}</Button>} />
          ) : (
            <div className="grid grid-cols-1 gap-3 p-5 pt-4 md:grid-cols-2">
              {state.rewards.map((reward, i) => (
                <div key={reward.id} style={{ ['--i' as string]: i }}
                  className={cn('border-line stagger group hover:border-brand rounded-xl border p-4 transition-colors',
                    !reward.active && 'opacity-55')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold">{reward.name}</p>
                      <p className="text-mute mt-1 text-[12px] leading-relaxed">{reward.description}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setEditing(reward)}
                      aria-label={`${t('common.edit')} ${reward.name}`}
                      className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge tone="accent"><Star className="h-3 w-3" />{t('loy.points', { n: reward.cost })}</Badge>
                    {!reward.active && <Badge tone="mute">{t('loy.notActive')}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader title={t('loy.topTitle')} subtitle={t('loy.topSub')} />
        {members.length === 0 ? (
          <EmptyState icon={<Star className="h-6 w-6" />} title={t('common.noData')} />
        ) : (
          <ul className="divide-line divide-y">
            {members.map(({ client, earned, tier }) => (
              <li key={client.id} className="flex flex-wrap items-center gap-3 p-4">
                <Avatar name={fullName(client)} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{fullName(client)}</p>
                  <p className="text-mute font-mono text-[11px]">{client.cardCode}</p>
                </div>
                <span className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide text-white uppercase"
                  style={{ background: tier.tint }}>
                  {t(`tier.${tier.id}` as never)}
                </span>
                <div className="w-32">
                  <div className="mb-1 flex items-baseline justify-between text-[11px]">
                    <span className="text-mute">{t('loy.balance')}</span>
                    <span className="font-bold tabular-nums">{client.points}</span>
                  </div>
                  <Progress value={(client.points / Math.max(1, earned)) * 100} />
                </div>
                <div className="flex items-center gap-2">
                  <WhatsAppButton phone={client.phone} iconOnly label={t('wa.sendCard')}
                    message={t('wa.msgCard', {
                      name: client.firstName, salon: state.settings.name,
                      url: cardUrl(state, client), points: client.points,
                    })} />
                  <Button variant="secondary" size="sm" onClick={() => setRedeemFor(client.id)}>
                    <Gift className="h-3.5 w-3.5" />{t('loy.redeem')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal open={!!redeemClient} onClose={() => setRedeemFor(null)} title={t('loy.redeemTitle')}
        subtitle={redeemClient ? t('loy.redeemSub', { name: fullName(redeemClient), points: redeemClient.points }) : undefined}
        footer={<Button variant="secondary" onClick={() => setRedeemFor(null)}>{t('common.close')}</Button>}>
        {redeemClient && (
          <ul className="space-y-2">
            {state.rewards.filter((r) => r.active).sort((a, b) => a.cost - b.cost).map((reward) => {
              const affordable = redeemClient.points >= reward.cost
              return (
                <li key={reward.id}
                  className={cn('border-line flex items-center gap-3 rounded-xl border p-3.5', !affordable && 'opacity-55')}>
                  <span className="text-accent bg-accent/15 grid h-10 w-10 shrink-0 place-items-center rounded-xl">
                    <Gift className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold">{reward.name}</p>
                    <p className="text-mute text-[11px]">{reward.description}</p>
                  </div>
                  <span className="shrink-0 text-[13px] font-bold tabular-nums">
                    {reward.cost} {t('loy.pointsShort')}
                  </span>
                  <Button variant={affordable ? 'primary' : 'secondary'} size="sm" disabled={!affordable}
                    title={affordable ? undefined : t('loy.notEnough')}
                    onClick={() => dispatch({
                      type: 'loyalty/redeem', payload: { clientId: redeemClient.id, rewardId: reward.id },
                    })}>
                    {t('loy.redeem')}
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </Modal>

      <RewardForm value={editing} onClose={() => setEditing(null)}
        onDelete={(id) => { dispatch({ type: 'reward/remove', payload: id }); setEditing(null) }} />
    </>
  )
}

function RewardForm({
  value, onClose, onDelete,
}: {
  value: Reward | 'new' | null
  onClose: () => void
  onDelete: (id: string) => void
}) {
  const { dispatch } = useSalon()
  const { t } = useI18n()
  const [form, setForm] = useState<Omit<Reward, 'id'>>(EMPTY)
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  const key = value === 'new' ? 'new' : (value?.id ?? null)
  if (key !== loadedFor) {
    setLoadedFor(key)
    setForm(value && value !== 'new' ? { ...value } : EMPTY)
  }

  function save() {
    if (!form.name.trim()) return
    if (value && value !== 'new') dispatch({ type: 'reward/update', payload: { ...value, ...form } })
    else dispatch({ type: 'reward/add', payload: form })
    onClose()
  }

  return (
    <Modal open={value !== null} onClose={onClose}
      title={value === 'new' ? t('loy.newReward') : t('loy.editReward')}
      footer={
        <>
          {value && value !== 'new' && (
            <Button variant="danger" className="mr-auto" onClick={() => onDelete(value.id)}>
              <Trash className="h-4 w-4" />{t('common.delete')}
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={save}>{t('common.save')}</Button>
        </>
      }>
      <div className="space-y-4">
        <Field label={t('loy.rewardName')}>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label={t('loy.rewardDesc')}>
          <Textarea rows={2} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <Field label={t('loy.rewardCost')}>
          <Input type="number" min={1} step={10} value={form.cost}
            onChange={(e) => setForm({ ...form, cost: Number(e.target.value) || 0 })} />
        </Field>
        <div className="bg-surface-2 flex items-center justify-between gap-4 rounded-xl p-3.5">
          <div>
            <p className="text-[13px] font-semibold">{t('loy.rewardActive')}</p>
            <p className="text-mute text-[11px]">{t('loy.rewardActiveSub')}</p>
          </div>
          <Switch checked={form.active} onChange={(v) => setForm({ ...form, active: v })} label={t('loy.rewardActive')} />
        </div>
        <div className="border-line rounded-xl border p-3.5">
          <p className="text-mute mb-2 text-[11px] font-bold tracking-wide uppercase">{t('loy.tiersTitle')}</p>
          <div className="flex flex-wrap gap-3">
            {LOYALTY_TIERS.map((tier) => (
              <span key={tier.id} className="flex items-center gap-1.5 text-[11px] font-medium">
                <span className="h-2 w-2 rounded-full" style={{ background: tier.tint }} aria-hidden="true" />
                {t(`tier.${tier.id}` as never)}
                <span className="text-mute">{tier.min}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
