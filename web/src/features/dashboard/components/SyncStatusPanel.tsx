import { useSyncStore } from '../../../stores/syncStore'

export function SyncStatusPanel() {
  const sync = useSyncStore()
  const syncItems = [
    { label: sync.online ? 'متصل' : 'دون اتصال', value: sync.syncing ? '…' : sync.online ? 'جاهز' : 'محلي', tone: sync.online ? 'ok' : 'wait' },
    { label: 'معلق', value: String(sync.pending), tone: 'wait' },
    { label: 'فشل', value: String(sync.failed), tone: 'fail' },
    { label: 'تعارض', value: String(sync.conflicts), tone: 'conflict' },
  ]
  return (
    <article className="panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">المزامنة</span>
          <h3>حالة البيانات</h3>
        </div>
      </div>

      <div className="sync-list">
        {syncItems.map((item) => (
          <div key={item.label}>
            <span className={'sync-dot ' + item.tone} />
            <strong>{item.label}</strong>
            <b>{item.value}</b>
          </div>
        ))}
      </div>
      {sync.online && (sync.pending + sync.failed > 0) && <button className="text-button" onClick={() => void sync.syncNow()}>مزامنة الآن</button>}
    </article>
  )
}

