# Snippet: Optymalizacja obrazów PNG → JPEG (Pillow)

## Problem

Obrazy produktów PNG mogą ważyć 2-5MB każdy, co powoduje:
- Wolne ładowanie strony
- Timeout przez proxy/CDN
- Wysokie koszty transferu

## Skrypt optymalizacji

```python
#!/usr/bin/env python3
"""
Konwertuje obrazy PNG do JPEG z kompresją.
Redukcja rozmiaru typowo 85-95%.
"""
from PIL import Image
from pathlib import Path
import os

def optimize_images(
    source_dir: str,
    output_dir: str = None,  # None = nadpisz oryginały
    max_width: int = 1200,
    quality: int = 85,
    extensions: tuple = ('.png', '.jpg', '.jpeg', '.webp')
):
    source = Path(source_dir)
    output = Path(output_dir) if output_dir else source
    output.mkdir(parents=True, exist_ok=True)
    
    total_before = 0
    total_after = 0
    count = 0
    
    for img_path in source.rglob('*'):
        if img_path.suffix.lower() not in extensions:
            continue
        if img_path.is_dir():
            continue
            
        original_size = img_path.stat().st_size
        total_before += original_size
        
        try:
            with Image.open(img_path) as img:
                # Konwertuj RGBA → RGB (JPEG nie obsługuje przezroczystości)
                if img.mode in ('RGBA', 'LA', 'P'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Resize jeśli za duży
                if img.width > max_width:
                    ratio = max_width / img.width
                    new_height = int(img.height * ratio)
                    img = img.resize((max_width, new_height), Image.LANCZOS)
                
                # Zapisz jako JPEG
                out_path = output / img_path.relative_to(source)
                out_path = out_path.with_suffix('.jpg')
                out_path.parent.mkdir(parents=True, exist_ok=True)
                
                img.save(out_path, 'JPEG', quality=quality, optimize=True)
                
                new_size = out_path.stat().st_size
                total_after += new_size
                count += 1
                
                reduction = (1 - new_size/original_size) * 100
                print(f"  {img_path.name} → {out_path.name}: "
                      f"{original_size/1024:.0f}KB → {new_size/1024:.0f}KB "
                      f"(-{reduction:.0f}%)")
                
        except Exception as e:
            print(f"  ERROR {img_path.name}: {e}")
    
    total_reduction = (1 - total_after/total_before) * 100 if total_before > 0 else 0
    print(f"\nPodsumowanie: {count} plików")
    print(f"Przed: {total_before/1024/1024:.1f}MB")
    print(f"Po: {total_after/1024/1024:.1f}MB")
    print(f"Redukcja: {total_reduction:.0f}%")

if __name__ == "__main__":
    optimize_images(
        source_dir="public/products",
        max_width=1200,
        quality=85
    )
```

## Użycie

```bash
# Instalacja
pip install Pillow

# Uruchomienie
python3 optimize_images.py

# Lub z parametrami
python3 -c "
from optimize_images import optimize_images
optimize_images('public/products', max_width=800, quality=80)
"
```

## Aktualizacja referencji w kodzie

Po konwersji PNG → JPEG zaktualizuj referencje w kodzie:

```bash
# W TypeScript/JavaScript
sed -i 's|/products/\([^"]*\)\.png|/products/\1.jpg|g' lib/product-catalog.ts
sed -i 's|/products/\([^"]*\)\.png|/products/\1.jpg|g' lib/products.json

# Sprawdź czy są jeszcze referencje
grep -rn "products/.*\.png" app/ components/ lib/
```

## Wyniki dla projektu Zoney

| Metryka | Wartość |
|---------|---------|
| Pliki | 89 obrazów |
| Przed | 80 MB |
| Po | 7 MB |
| Redukcja | **91%** |
| Jakość | 85 (niezauważalna różnica) |
