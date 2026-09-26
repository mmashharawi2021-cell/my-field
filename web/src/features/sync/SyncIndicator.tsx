import { useSyncStore } from '../../stores/syncStore'
import { useEffect, useState } from 'react'
import { offlineDatabase } from '../../services/offlineDatabase'
import { session } from '../../services/session'
import type { SyncOperation } from '../../types/sync'

export function SyncIndicator() {
  const state = useSyncStore()
  const [open, setOpen] = useState(false)
  const [operations, setOperations] = useState<SyncOperation[]>([])
  useEffect(() => {
    if (!open) return
    const load = () => void offlineDatabase.listQueue(session.getUser()?.id ?? '').then(setOperations)
    load(); window.addEventListener('myfield:sync-change', load)
    return () => window.removeEventListener('myfield:sync-change', load)
  }, [open, state.pending, state.failed, state.conflicts])
  const total = state.pending + state.failed + state.conflicts
  const label = !state.online ? 'دون اتصال' : state.syncing ? 'جارِ المزامنة…' : state.conflicts ? `${state.conflicts} تعارض` : state.failed ? `${state.failed} فشل` : state.pending ? `${state.pending} معلّق` : 'متزامن'
  return <div className={`sync-indicator ${!state.online ? 'offline' : state.conflicts ? 'conflict' : total ? 'pending' : 'synced'}`} role="status">
    <button type="button" className="sync-summary" onClick={() => setOpen((value) => !value)}><span className="sync-status-dot" /> <b>{label}</b></button>
    {state.online && total > 0 && !state.syncing && <button type="button" onClick={() => void state.syncNow()}>مزامنة الآن</button>}
    {open && <section className="sync-queue-panel"><h4>طابور المزامنة</h4>
      {operations.length === 0 ? <p>لا توجد تغييرات معلّقة.</p> : operations.map((item) => <article key={item.id}>
        <div><b>{item.kind}</b><span>{item.status === 'conflict' ? 'تعارض يحتاج مراجعة' : item.status === 'failed' ? 'فشل وسيعاد لاحقًا' : 'بانتظار المزامنة'}</span></div>
        <small>{item.featureId.slice(0, 8)}… · {new Date(item.createdAt).toLocaleString('ar')}</small>
        {item.error && <small className="sync-error">{item.error}</small>}
        {item.status === 'conflict' && <button onClick={async () => { await offlineDatabase.deleteOperation(item.id); await state.refresh() }}>تجاهل التغيير المحلي</button>}
      </article>)}
    </section>}
  </div>
}

