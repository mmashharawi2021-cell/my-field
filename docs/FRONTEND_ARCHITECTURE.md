# My Field Frontend Architecture

## الهدف

الواجهة مبنية بأسلوب Component-Based + Feature-Based حتى تكون الأجزاء مستقلة قدر الإمكان.

## القواعد

1. الصفحات في `pages/` مسؤولة عن تركيب المكونات فقط.
2. عناصر الواجهة العامة في `components/`.
3. منطق كل ميزة ومكوناتها في `features/<feature>/`.
4. بيانات التنقل والإعدادات العامة في `config/`.
5. Types المشتركة في `types/`.
6. الاتصال بالـ API في `services/`.
7. CSS مقسم إلى ملفات مستقلة حسب المسؤولية.
8. حذف زر أو Card أو Toolbar action لا يجب أن يعطل Router أو الصفحة الأساسية.
9. لا يوضع منطق قاعدة البيانات أو API داخل Button أو Card.
10. كل ميزة جديدة تضاف كمجلد مستقل بدل تضخيم App.tsx.

## الهيكل

```text
web/src/
├── app/
│   ├── App.tsx
│   ├── AppProviders.tsx
│   └── AppRoutes.tsx
├── components/
│   ├── layout/
│   ├── navigation/
│   └── ui/
├── config/
├── features/
│   ├── dashboard/
│   ├── map/
│   └── projects/
├── pages/
├── services/
├── styles/
└── types/
```

## مبدأ الاستقلال

مثال: زر "مشروع جديد" هو `ActionButton` داخل `ProjectsHeader`. إزالة الزر لا تؤثر على ProjectCard أو ProjectsPage أو Router.

MapToolbar منفصل عن MapCanvas، وLayerPanel منفصل عن FeatureDetailsPanel. لذلك تعديل أداة أو حذفها لا يغير قلب الخريطة.
