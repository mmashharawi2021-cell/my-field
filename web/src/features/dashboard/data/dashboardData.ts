export type StatItem = {
  label: string
  value: string
  note: string
}

export type ProgressItem = {
  name: string
  progress: number
}

export type SyncItem = {
  label: string
  value: string
  tone: 'ok' | 'wait' | 'fail' | 'conflict'
}

export const dashboardStats: StatItem[] = [
  { label: 'المشاريع النشطة', value: '03', note: '+1 هذا الشهر' },
  { label: 'الطبقات', value: '18', note: '12 قابلة للتحرير' },
  { label: 'العناصر المكانية', value: '12,486', note: '+327 هذا الأسبوع' },
  { label: 'بانتظار المراجعة', value: '24', note: 'تحتاج متابعة' },
]

export const projectProgress: ProgressItem[] = [
  { name: 'حصر الأضرار التجريبي', progress: 68 },
  { name: 'شبكة المياه', progress: 42 },
  { name: 'بيانات المرافق', progress: 84 },
]

export const syncItems: SyncItem[] = [
  { label: 'متزامن', value: '12,438', tone: 'ok' },
  { label: 'معلق', value: '37', tone: 'wait' },
  { label: 'فشل', value: '8', tone: 'fail' },
  { label: 'تعارض', value: '3', tone: 'conflict' },
]
