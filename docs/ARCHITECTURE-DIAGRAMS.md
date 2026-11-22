# Architecture diagrams — project တစ်ခုချင်းအတွက် 2D / 3D diagram ထည့်နည်း

Project case study ထဲက **Architecture** section ဟာ interactive stage ပါ: 2D ↔ 3D ပြောင်းလို့ရပြီး
flow button နှိပ်ရင် request (packet) တွေ node ကြား ပြေးပြတယ်။ Engine ကို
`node_allin1/docs/STAGE-ENGINE.md` ကနေ port လုပ်ထားတာ — အသေးစိတ် သင်္ချာ (projection, painter sort,
Bézier sample) က အဲဒီ file မှာ။ ဒီ file က **ဒီ portfolio မှာ diagram အသစ် ထည့်နည်း** ပဲ။

---

## 1. File map

| File | တာဝန် |
|---|---|
| `src/components/arch/types.ts` | `Scene`, `SceneNode`, `Hop`, `Flow`, `Architecture` (data shape) |
| `src/components/arch/Stage.tsx` | 2D view + `ICON` (node kind တစ်ခုချင်းရဲ့ icon) |
| `src/components/arch/IsoStage.tsx` | 3D view: `proj`, `Box`, `Cylinder`, `SOLID` (kind တစ်ခုချင်းရဲ့ shape/size) |
| `src/components/arch/motion.ts` | packet ကို path တလျှောက် ရွှေ့ (rAF + `getPointAtLength`) |
| `src/components/arch/usePlayer.ts` | flow (lanes of hops) → packets / tags / caption |
| `src/components/arch/ArchitectureDiagram.tsx` | toolbar (flow buttons + 2D/3D) + stage |
| `src/components/arch/arch.css` | style အားလုံး; token တွေကို `.arch` အောက်မှာပဲ scope လုပ်ထား |
| `src/data/architectures/<slug>.ts` | **project တစ်ခုရဲ့ diagram** (scene + flows) |
| `src/data/architectures/index.ts` | slug → diagram registry |

Library အပို မသုံးဘူး — React + SVG + CSS ပဲ။

---

## 2. Diagram အသစ် ထည့်နည်း (step by step)

1. **File ဖန်တီး:** `src/data/architectures/<project-slug>.ts`
   (`market-price-pro.ts` ကို copy ယူပြီး စ)။ Slug က `/admin/projects` မှာ ပေးထားတဲ့ slug နဲ့ **တူရမယ်**။
2. **Scene ရေး** — floor plan `1200 × 600` units:
   - ဘယ် → ညာ = request flow။ Column ခွဲ: **clients (x≈120) · app / cluster (x≈450–700) · data (x≈1030)**
   - Column ကြား ~170+ unit ခြား (3D label မထပ်အောင်)
   - ဘယ်ဘက်ထိပ် (x < 400, y < 110) ကို လွတ်ထား — caption box ပေါ်တဲ့ နေရာ
   - Cluster / VPC လိုမျိုး = `groups` (dashed box)
3. **Node kind ရွေး** — shape က အဓိပ္ပာယ် မှန်ရမယ်:

   | kind | ဘာလဲ | 3D shape |
   |---|---|---|
   | `mobile` | iOS / Android app | ဖုန်း (ပါးပါး ထောင်ထောင်) |
   | `browser` | web app / admin panel | screen |
   | `client` | လူ / user | device box နိမ့်နိမ့် |
   | `server` | API / app server | rack box + LED |
   | `job` | cron / worker / queue consumer | box အသေး |
   | `db` | **DB server တစ်ခု** (MySQL, Postgres) | cylinder |
   | `cache` | Redis / Memcached | cylinder ပုပု (အနီ) |
   | `external` | Firebase, S3, Stripe … | box ပြား (အဝါ) |
   | `index` / `rows` | table ထဲက B-tree / rows (DB deep-dive diagram မှသာ) | B-tree / slab |

4. **`labelSide`** (3D label နေရာ): clients = `left`, data = `right`, အလယ် = `top`/`bottom`/`right`။
   Label ထပ်ရင် ဒါကို အရင်ပြောင်း၊ ပြီးမှ node ရွှေ့။
5. **Links:** `{ id: "a-b", from: "a", to: "b" }` — id ကို flow ထဲမှာ ပြန်သုံးမယ်။
6. **Flows ရေး** (button တစ်ခု = flow တစ်ခု, ၃–၅ ခု):
   - `travel` = link ပေါ် packet ပြေး (`reverse: true` = to → from, response ပြန်လာတာ)
   - `pulse` = node မှာ tag ပေါ် + caption ပြောင်း
   - **Lane** = request တစ်ခု; lane အများကြီး = တစ်ပြိုင်နက် request (`stagger` ms ခြားပြီး စ)
   - Tone: `info` (သွားနေ) · `ok` (အောင်) · `replay` (cache miss / retry / clear) · `error`
   - Lane များရင် **lead lane ပဲ tag ချ** — မဟုတ်ရင် tag တွေ ထပ်ပြီး card တွေကို ဖုံးတယ်
     (`market-price-pro.ts` ရဲ့ `burstRead(client, lead)` ကြည့်)
   - `note` = stage အောက်က စာတစ်ကြောင်း: ဒီ flow က ဘာကို ပြတာလဲ
7. **Register:** `src/data/architectures/index.ts` ထဲ `"<slug>": <export>` ထည့်
8. **စစ်:** `npm run dev` → homepage → project ဖွင့် → flow တိုင်း 2D နဲ့ 3D နှစ်ခုလုံးမှာ နှိပ်ကြည့်

---

## 3. စည်းမျဉ်း

- **အမှန်ပဲ ရေး:** ကိုယ်တကယ် မလုပ်ခဲ့တာ (autoscaling, queue, …) diagram ထဲ မထည့်ရ။
  Interview မှာ diagram ထဲက box တိုင်းကို ရှင်းပြနိုင်ရမယ်။
- **Timing မထည့်:** `ms` က တကယ် တိုင်းထားတာ ရှိမှသာ။ Portfolio diagram တွေက illustrative ပါ။
- Client / company project ဆို internal hostname, table name, customer data မပါစေနဲ့။
- Shape / icon အသစ် လိုရင်: `NodeKind` ထဲ ထည့် → `SOLID` (IsoStage) → `ICON` (Stage) →
  `arch.css` မှာ `.kind-<name>` အရောင်။

---

## 4. Static image (cover / social preview)

Interactive diagram က case study ထဲမှာပဲ ပေါ်တယ်။ Card cover အတွက် 16:9 static SVG/PNG
တစ်ပုံ သီးသန့် လိုရင် `public/projects/<slug>-architecture.svg` မှာ ထား
(ဥပမာ `market-price-pro-architecture.svg`)။
