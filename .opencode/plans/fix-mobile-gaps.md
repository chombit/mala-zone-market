# Fix 6 Mobile UI Structural Gaps

## Fix 1: Hero dots → bottom center
**File:** `src/components/mobile/MobileHeroBanner.tsx:114`
- Change `className="absolute bottom-3 right-5 flex items-center gap-1.5 z-10"` 
- To `className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 z-10"`

## Fix 2: Hero → split layout (text left, image right)
**File:** `src/components/mobile/MobileHeroBanner.tsx:68-116`
- Restructure from overlay approach to split layout
- Left side (60%): badge, title, subtitle, verified tag, CTA button
- Right side (40%): full-height image
- Background: dark navy, rounded-2xl

New structure:
```tsx
<div className="bg-[#0B132B] rounded-2xl overflow-hidden h-[200px] flex">
  {/* Left Content (60%) */}
  <div className="w-[60%] flex flex-col justify-between p-4 z-10">
    <div>
      <span className="inline-flex items-center gap-1 bg-yellow-400 text-[#0B132B] text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
        <Star className="w-2.5 h-2.5 fill-current" />
        {slide.badge}
      </span>
      <h2 className="text-white text-lg font-black mt-2 leading-tight">{slide.title}</h2>
      <p className="text-white/60 text-[11px] font-semibold mt-1">{slide.subtitle}</p>
      {slide.verified && (
        <div className="flex items-center gap-1 mt-1.5">
          <CheckCircle2 className="w-3 h-3 text-[#00A86B]" />
          <span className="text-[9px] font-bold text-[#00A86B]">Verified</span>
        </div>
      )}
    </div>
    <button className="self-start flex items-center gap-1.5 bg-white text-[#0B132B] px-4 py-2 rounded-full text-[11px] font-black active:scale-95 transition-transform">
      Explore Now <ArrowRight className="w-3 h-3" />
    </button>
  </div>
  {/* Right Image (40%) */}
  <div className="w-[40%] relative">
    <img src={slide.image} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
  </div>
</div>
```

## Fix 3: Category icons
**File:** `src/components/mobile/MobileCategoryGrid.tsx:11-21`
- Import `House` from lucide-react (add to imports)
- Change `{ id: 'property', icon: Building2, ... }` → `{ id: 'property', icon: House, ... }`
- Change `{ id: 'heavy', icon: Settings, ... }` → `{ id: 'heavy', icon: Truck, ... }`

## Fix 4: Category labels
**File:** `src/components/mobile/MobileCategoryGrid.tsx:14-21`
- Change category mappings to match prompt:
  - Buy → `{ id: 'property', icon: House, label: 'Buy', color: '#3B82F6' }`
  - Rent → `{ id: 'stay', icon: Key, label: 'Rent', color: '#22C55E' }`
  - Land → `{ id: 'property', icon: Map, label: 'Land', color: '#14B8A6' }` (or add land label)
  - Cars → `{ id: 'motors', icon: Car, label: 'Cars', color: '#3B82F6' }`
  - Machinery → `{ id: 'heavy', icon: Truck, label: 'Machinery', color: '#F97316' }`
  - More → `{ id: 'all', icon: LayoutGrid, label: 'More', color: '#8B5CF6' }`
- Since labels are now hardcoded English per prompt (not translated), use `label` directly instead of `labelKey`/`t()`

## Fix 5: Bottom nav 2nd item → Search
**File:** `src/components/BottomNavigation.tsx:26-32`
- Already partially done. Verify navItems array has:
  - `{ id: 'all', icon: Home, label: 'Home' }`
  - `{ id: 'search', icon: Search, label: 'Search' }`  ← this was the old "Category"
  - `{ id: 'post', icon: Plus, label: 'Post', isCenter: true }`
  - `{ id: 'favorites', icon: Heart, label: 'Saved' }`
  - `{ id: 'profile', icon: User, label: 'Profile' }`
- Update `handleClick` to handle `id === 'search'` by scrolling to catalog
- The Category modal is no longer triggered from bottom nav (it's in the slide-out menu from MobileHeader)

## Fix 6: Search bar → rounded-full
**File:** `src/components/mobile/MobileSearchBar.tsx:23`
- Change `rounded-xl` → `rounded-full` on the search input container

## Verification
After all fixes, run: `npx tsc --noEmit --skipLibCheck` to verify no type errors.
