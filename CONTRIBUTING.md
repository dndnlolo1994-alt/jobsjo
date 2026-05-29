# المساهمة

- الدومين الرسمي للإنتاج: `https://www.jordan-job.shop` — راجع [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
- حافظ على الواجهة العربية بالكامل.
- لا تضف بيانات حقيقية لأشخاص أو شركات في seed.
- لا تضف scraping لمصادر خاصة أو خلف تسجيل دخول.
- شغّل قبل التسليم:

```bash
npm run lint
npm run typecheck
npm run build
npm run prisma:validate
```

- اجعل التغييرات محدودة وواضحة، وأضف توثيقًا عند تغيير سلوك المنتج.
