# LuggageShare — Marketing Plan

A practical, phased plan to take LuggageShare from "working app" to a liquid two-sided
marketplace in Saudi Arabia. Written 2026-11-16 against the current state of the product
(Android build working end to end, API live, not yet on the app stores).

---

## 1. What we are selling, to whom

**One sentence:** Travelers sell their spare luggage kilograms; senders ship items for a
fraction of courier prices, person to person, with in-app payment and reviews.

| Side | Who | Their job-to-be-done | The hook |
|---|---|---|---|
| Carriers | Frequent domestic flyers (Riyadh⇄Jeddah/Dammam), expats flying home, students | "My ticket is paid — make the empty kilos pay me back" | "Your empty suitcase is worth 200–500 SAR per trip" |
| Senders | Expats sending things home, families sending gifts, small sellers, people who forgot something in another city | "Courier is slow/expensive; a flight leaves in 3 hours" | "Same-day delivery between cities for the price of lunch" |

**Priority corridors (in order):**
1. **Domestic KSA** — Riyadh⇄Jeddah, Riyadh⇄Dammam. Same-day, no customs, lowest trust
   barrier. This is the launch market.
2. **Gulf** — KSA⇄Dubai, KSA⇄Bahrain/Doha/Kuwait. Weekend traffic, shopping runs.
3. **Expat corridors** — KSA⇄Cairo, KSA⇄Amman, KSA⇄Karachi/Lahore, KSA⇄Manila/Jakarta.
   Massive volume, strongest emotional story ("mom's cooking, delivered"), but introduce
   only after trust features are proven (customs messaging must be careful — see §8).

**Seasonal spikes to plan content around:** Ramadan & both Eids (gifts), Hajj/Umrah
season (Zamzam, dates, prayer rugs), summer exodus (June–Aug), back-to-university
(Sep & Jan), Saudi National Day (Sep 23), White Friday (Nov).

---

## 2. Phase 0 — Prerequisites (blockers before spending 1 riyal)

These are product/ops items marketing depends on. Most are already done.

- [x] Full booking cycle works in production (verified on two physical devices)
- [x] Push notifications (Firebase live)
- [x] Referral/credits system in the app (10 SAR signup credits, two-sided referral bonus,
      15% commission) — this *is* the growth engine; marketing just amplifies it
- [x] Arabic + English with full RTL
- [ ] **Google Play listing (internal → closed → production)** — nothing else matters
      until a stranger can install the app from a link
- [ ] iOS build + App Store (large share of Saudi users are on iPhone — treat as P1)
- [ ] Custom domain (luggageshare.com is parked; web app lives on a vercel.app URL —
      either buy/point the domain or pick a brand you can own)
- [ ] Terms/Privacy reviewed by a human (they are live but were not legally reviewed)
- [ ] A support inbox that someone actually reads (help@…) + WhatsApp Business number

---

## 3. Phase 1 — Private beta (weeks 1–4): manufacture liquidity by hand

A marketplace with 0 trips is a dead screen. Do not announce publicly until the Riyadh⇄Jeddah
feed always shows ≥5 upcoming trips.

1. **Recruit 30–50 seed carriers by hand.** Where they already are:
   - X (Twitter) search: people complaining about Aramex/SMSA/courier prices or delays
   - University groups (KSU, KAU, KFUPM) — students fly these routes weekly
   - Aviation/travel-deal Telegram & WhatsApp groups (Saudi flight-deals groups are huge)
   - Your own network: everyone who flies monthly gets white-glove onboarding
2. **Seed incentive:** first 100 carriers get 0% commission for 90 days + "Founding
   Carrier" badge (product already supports credits; badge is a 1-line feature ask).
3. **Concierge the first 50 deliveries.** Founders personally match sender↔carrier in a
   WhatsApp group if the app doesn't. Every completed delivery = photo + testimonial
   (with permission) = launch content bank.
4. **Measure:** time-to-first-offer per listing, % trips with ≥1 booking, NPS after delivery.

---

## 4. Phase 2 — Public launch (weeks 5–8)

### Channel priorities for KSA (in order of expected ROI)

| # | Channel | Why | Play |
|---|---|---|---|
| 1 | **TikTok** | Highest reach-per-riyal in KSA; algorithm rewards new accounts | 3–5 posts/week, Arabic-first. POV videos, not ads |
| 2 | **Snapchat** | Still massive in KSA, especially Riyadh/Jeddah 18–30 | Repurpose TikToks; Snap Ads later (geo-targeted airports) |
| 3 | **X (Twitter)** | Saudi X is where complaints about couriers live | Reply-guy strategy + launch thread; Arabic memes |
| 4 | **Instagram Reels** | Expat + female audience segments | Same content, localized captions |
| 5 | **WhatsApp/Telegram communities** | Expat groups = ready-made sender demand | Admin partnerships: group-exclusive promo codes |
| 6 | **Google Play ASO / Apple ASO** | Free, compounding | See §6 |

Paid ads: **not before week 8.** Organic + referral first; buy installs only once
activation (install → first booking) is >20%, otherwise you're buying churn.

### Launch-week sequence
- Day 1: X thread (founder voice, the "why", screenshots, promo code) + TikTok #1
- Day 2–3: push to 5 expat/travel groups via admins (each gets its own code to track)
- Day 4: "first 100 deliveries" milestone post with real numbers
- Day 7: PR pitch to Saudi tech media (Argaam Tech, ArabNet, Lovin Saudi, STV newsletter
  orbit): "Saudi app turns empty suitcases into income"

---

## 5. Social accounts — setup checklist (≈45 min, needs a human)

I can't create social accounts (phone verification, platform ToS require a person), so
here is the exact checklist. Use the **same handle everywhere** — check availability for
`luggageshare.sa` / `luggagesharesa` / Arabic display name **"لقج شير"** or a cleaner
Arabic brand like **"شنطة | Shanta"** (worth a 10-minute naming discussion before
creating anything — an Arabic-first name will outperform in KSA).

- [ ] TikTok Business account — bio: "وصّل أغراضك مع مسافر موثوق ✈️ | Ship with trusted travelers"
- [ ] Snapchat Public Profile
- [ ] X account + link in bio to Play Store
- [ ] Instagram Business (link TikTok content)
- [ ] WhatsApp Business (catalog = "How it works" + support)
- [ ] Linktree or /go page on your domain with install links + promo code field
- [ ] Google Play Console developer name consistent with brand
- All accounts: same logo (the new suitcase+plane icon), same purple `#7C6AFF` grid style,
  bilingual bios, support email in bio.

---

## 6. App Store Optimization

- **Title (Play):** "LuggageShare: شحن مع مسافرين — Ship with Travelers"
- **Keywords to own (AR):** شحن رخيص، توصيل أغراض، مسافرين، شحن سريع بين المدن، توصيل من
  الرياض الى جدة، شحن حقائب
- **Keywords (EN):** luggage share, peer shipping, send package traveler, cheap shipping
  saudi, same day delivery riyadh jeddah
- **Screenshots:** 1) "Earn 300 SAR from your next flight" over the trips feed, 2) booking
  flow, 3) chat + live status timeline, 4) wallet with credits, 5) reviews/trust. All in
  Arabic for the KSA storefront, English for the secondary locale.
- First 20 reviews: ask every concierge-batch user personally after delivery (in-app
  prompt exists via the review step — add a store-review nudge after a 5★ in-app review).

---

## 7. Content engine — 4 repeatable formats + ready-to-post drafts

**Formats (shoot once a week, batch of 4–5):**
1. **POV carrier:** "Flying RUH→JED with an empty bag" → open app → accept 2 bookings →
   airport handoff → wallet +250 SAR. (Money-counter overlay performs.)
2. **POV sender:** "I forgot my laptop charger in Riyadh at 9am… it landed in Jeddah at 1pm."
3. **Price battles:** split screen — courier quote & 3 days vs LuggageShare & same day.
4. **Delivery stories (UGC):** the Eid-gift-to-grandma genre. Highest share rate; always
   with consent.

**Draft — launch thread (X, Arabic):**
> كل يوم تطير شنط نص فاضية بين الرياض وجدة ✈️
> وفي نفس الوقت ناس تدفع ٨٠ ريال وتنتظر ٣ أيام لتوصيل غرض صغير.
>
> سوّينا تطبيق يحل الاثنين:
> المسافر يبيع الكيلوات الفاضية في شنطته، والمرسل يوصّل أغراضه بنفس اليوم وبنص السعر.
>
> دفع داخل التطبيق، توثيق هوية، تقييمات، وتتبع مباشر 🧵👇

**Draft — TikTok hook lines (AR):**
- «راتبك ما يكفي؟ شنطتك الفاضية تقدر تساعدك» (carrier)
- «أرخص شحن بالسعودية مو شركة شحن… مسافر» (sender)
- «وصّلت ٥ كيلو من الرياض لجدة بـ٧٥ ريال بنفس اليوم. كيف؟» (sender)

**Draft — expat-group post (EN, for admins to share):**
> Sending something home to Cairo/Amman/Karachi? ✈️ LuggageShare matches you with a
> verified traveler already flying that route — same-day, fraction of courier prices,
> payment held in-app until delivery. Group-exclusive: code **[GROUPNAME]** = 15 SAR
> credit on your first delivery.

**Cadence:** 3 TikToks + 3 Snaps + 2 Reels + 3 X posts/week. One person, half a day,
batch-produced. Reply to every comment for the first 90 days.

---

## 8. Trust & safety messaging (non-negotiable)

This category's #1 objection is *"what if the package contains something illegal?"* —
address it loudly, never defensively:

- Every surface repeats the trio: **ID-verified users · payment held until delivery ·
  carrier sees the item open before accepting it**
- Publish a clear **prohibited-items list** page and link it in every bio
- Content rule: carriers always inspect items **on camera** in videos — model the behavior
- Domestic-first framing keeps customs out of the conversation at launch; for
  international corridors later, add "declare it, open it, photograph it" guidance and a
  value cap before you market those routes
- One bad incident at this stage outweighs 10,000 installs: manual review of first-time
  users' first bookings is cheap insurance

---

## 9. Referral & retention loop (already built — just light it up)

The app already has: 10 SAR welcome credits, two-sided referral bonuses, wallet, push.

- Surface the invite code on the post-delivery "rate your experience" high — happiest moment
- Carrier loop: after payout push → "Fly often? Share your code, earn 10 SAR per carrier you bring"
- Monthly "Top Carrier" shout-outs on social (badge exists in the UI) — status is free fuel
- Win-back push 48h before popular dates: "Flying for Eid? 3 senders are waiting on RUH→CAI"

---

## 10. Budget & targets (first 90 days, lean)

| Item | SAR/month |
|---|---|
| Content creator (part-time, shoots + edits) | 3,000–5,000 |
| Seed credits & promo codes | 2,000 |
| 3–5 micro-influencers (10–50k, travel/budget niche) | 3,000 |
| Snap/TikTok ads (only after week 8, if activation >20%) | 0 → 5,000 |
| Tools (Linktree, scheduler, analytics) | 300 |

**North-star metric: completed deliveries per week.**

| Milestone | Target |
|---|---|
| Week 4 (end of beta) | 50 completed deliveries, ≥5 live trips always visible on RUH⇄JED |
| Week 8 | 300 installs/week organic, 25% install→signup, 100 deliveries/week |
| Week 12 | 250 deliveries/week, CAC < 15 SAR, ≥35% of new users from referral codes |

Instrument now: UTM-coded install links per channel/group, promo-code redemptions table
(exists via credits), weekly cohort retention. If a channel can't be measured, don't spend on it.

---

## 11. This week's to-do list

1. Decide the Arabic-first brand/handle question (§5) — 30 min, blocks everything else
2. Play Console: internal testing track → closed beta link (the AAB profile is already
   configured in `eas.json`)
3. Create the 6 social accounts per checklist; upload the icon set
4. Buy/point the domain; put Terms, Privacy, prohibited-items, and /go install page on it
5. Start seed-carrier recruitment DMs (target: 10 this week)
6. Shoot content batch #1 (formats 1 & 3) — even on a test flight RUH→JED

---

*Prepared by Claude (Fable 5). Account creation, domain purchase, and Play Console
submission need a human — everything in §5/§11 is sequenced for that. Post drafts above
are ready to use; ask for more variants (per route, per season, per platform) anytime.*
