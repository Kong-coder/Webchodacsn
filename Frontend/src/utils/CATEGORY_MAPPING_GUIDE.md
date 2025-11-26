# Category Mapping Guide

## Overview

This utility provides centralized category definitions to ensure consistency across the entire application.

## Problem Solved

**Before:**
- Admin page showed: "Massage", "Chăm Sóc Da", "Trị Liệu", "Chăm Sóc Tóc"
- Client page showed: "massage", "skincare", "therapy", "hair"
- Inconsistent display names across pages

**After:**
- Centralized mapping in `categoryMapper.js`
- Both pages use the same Vietnamese names
- Easy to add/modify categories in one place

## Usage

### Import

```javascript
import { 
  CATEGORIES, 
  getCategoryName, 
  getCategoryIcon,
  getAllCategories 
} from '../../utils/categoryMapper';
```

### Get Category Display Name

```javascript
// Convert English key to Vietnamese name
const displayName = getCategoryName('massage');  // Returns: "Massage"
const displayName2 = getCategoryName('skincare'); // Returns: "Chăm Sóc Da"
```

### Get Category Icon

```javascript
const icon = getCategoryIcon('massage');  // Returns: "💆"
const icon2 = getCategoryIcon('therapy'); // Returns: "🌿"
```

### Get All Categories

```javascript
const allCategories = getAllCategories();
// Returns: [
//   { key: 'massage', name: 'Massage', icon: '💆' },
//   { key: 'skincare', name: 'Chăm Sóc Da', icon: '✨' },
//   { key: 'therapy', name: 'Trị Liệu', icon: '🌿' },
//   { key: 'hair', name: 'Chăm Sóc Tóc', icon: '💇' }
// ]
```

### Use in Dropdown

```javascript
// Admin page - Quanly.js
import { CATEGORIES } from '../../utils/categoryMapper';

const categories = CATEGORIES;

// In JSX
<Form.Select>
  {Object.entries(categories).map(([key, value]) => (
    <option key={key} value={key}>{value}</option>
  ))}
</Form.Select>
```

### Use in Display

```javascript
// Client page - Service.js
import { getCategoryName, getCategoryIcon } from '../../utils/categoryMapper';

// Display category with icon and name
<div>
  <span>{getCategoryIcon(service.category)}</span>
  <span>{getCategoryName(service.category)}</span>
</div>
```

## Category Definitions

| Key | Vietnamese Name | Icon | Description |
|-----|----------------|------|-------------|
| `massage` | Massage | 💆 | Massage services |
| `skincare` | Chăm Sóc Da | ✨ | Skincare treatments |
| `therapy` | Trị Liệu | 🌿 | Therapy services |
| `hair` | Chăm Sóc Tóc | 💇 | Hair care services |

## Adding New Categories

To add a new category:

1. **Update `categoryMapper.js`:**

```javascript
export const CATEGORIES = {
  massage: "Massage",
  skincare: "Chăm Sóc Da",
  therapy: "Trị Liệu",
  hair: "Chăm Sóc Tóc",
  nails: "Chăm Sóc Móng",  // NEW
};

export const CATEGORY_ICONS = {
  massage: "💆",
  skincare: "✨",
  therapy: "🌿",
  hair: "💇",
  nails: "💅",  // NEW
};
```

2. **No need to update other files!** The mapping is automatic.

## Files Using Category Mapping

- ✅ `pages/admin/Quanly.js` - Service management
- ✅ `pages/client/Service.js` - Service listing
- ✅ `utils/apiMappers.js` - API response mapping

## Best Practices

1. **Always use English keys in database** - Store "massage", "skincare", etc.
2. **Always use mapping for display** - Show "Massage", "Chăm Sóc Da", etc.
3. **Never hardcode category names** - Use `getCategoryName()` instead
4. **Keep icons consistent** - Use emoji or icon library

## Migration Checklist

When adding category display to a new page:

- [ ] Import `getCategoryName` and/or `getCategoryIcon`
- [ ] Replace hardcoded category names with `getCategoryName(key)`
- [ ] Add icons using `getCategoryIcon(key)` if needed
- [ ] Test with all category types
- [ ] Verify Vietnamese names display correctly

## Examples

### Example 1: Service Card

```javascript
import { getCategoryName, getCategoryIcon } from '../../utils/categoryMapper';

const ServiceCard = ({ service }) => (
  <div className="service-card">
    <h3>{service.name}</h3>
    <div className="category">
      {getCategoryIcon(service.category)} {getCategoryName(service.category)}
    </div>
    <p>{service.description}</p>
  </div>
);
```

### Example 2: Category Filter

```javascript
import { getAllCategories } from '../../utils/categoryMapper';

const CategoryFilter = ({ onSelect }) => {
  const categories = getAllCategories();
  
  return (
    <div className="category-filter">
      <button onClick={() => onSelect('all')}>Tất cả</button>
      {categories.map(cat => (
        <button key={cat.key} onClick={() => onSelect(cat.key)}>
          {cat.icon} {cat.name}
        </button>
      ))}
    </div>
  );
};
```

### Example 3: Category Badge

```javascript
import { getCategoryName } from '../../utils/categoryMapper';

const CategoryBadge = ({ categoryKey }) => (
  <span className={`badge badge-${categoryKey}`}>
    {getCategoryName(categoryKey)}
  </span>
);
```

## Troubleshooting

### Issue: Category shows as English key

**Problem:** Seeing "massage" instead of "Massage"

**Solution:** Make sure you're using `getCategoryName()`:
```javascript
// ❌ Wrong
<span>{service.category}</span>

// ✅ Correct
<span>{getCategoryName(service.category)}</span>
```

### Issue: Category not found

**Problem:** `getCategoryName()` returns the input unchanged

**Solution:** Check if the category key exists in `CATEGORIES` object. Add it if missing.

### Issue: Icons not showing

**Problem:** No icon appears

**Solution:** Make sure you're using `getCategoryIcon()` and the category has an icon defined.

## Future Enhancements

Possible improvements:

1. **Multi-language support** - Add English, Chinese, etc.
2. **Category colors** - Define color schemes per category
3. **Category descriptions** - Add detailed descriptions
4. **Category images** - Add representative images
5. **Category hierarchy** - Support sub-categories
6. **Dynamic categories** - Load from database/API

---

*Last updated: November 17, 2025*
