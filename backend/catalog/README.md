# Ayla product entry

The Arabic copy in `ayla-products.json` is an **upload source**, not a frontend
constant or a replacement for the site's database. The storefront does not
import it. `images/` contains optimized upload files. `preview.html` is a local
review document; it is not a published store page.

The uploader signs in through the existing admin API, uploads the images to
the site's image storage, creates categories and products through their admin
endpoints, and checks the stored product and image afterward. Products can
then be edited in the existing admin panel.

## Prepared data

- 25 image assignments with Arabic names, short descriptions, full copy,
  department and category, variant labels, and matching photographs.
- Usage instructions and benefits for body and hair products.
- Sizes are included where the supplied labels show them: 30 ml fragrances
  and underarm cream, and 250 ml body butters.
- Ingredients are transcribed only for the body butter whose label lists them.
- Unknown prices, stock, perfume notes and ingredients are not invented.
- `reviewRequired` records unresolved information for the operator. It is not
  sent to the storefront as a product field.

The two powder-musk photos share the same printed name but different colors.
Keep their inventory entries unselected until the owner confirms whether to
combine them. Multi-bottle photos also need confirmed selling units and scent
names. All rows start unselected, with null prices and stock.

## Upload

Run from `backend`:

```powershell
npm run catalog:prepare
npm run catalog:upload -- --dry-run
```

Fill `ayla-inventory.json` with each product's actual `priceILS` (in shekels)
and `stock` (whole units). Select products by setting `publish` to `true`.
For example, a **synthetic illustration only**, not this store's price:

```json
{
  "publish": true,
  "priceILS": 123.45,
  "stock": 7
}
```

Optional inventory overrides: `name`, `shortDescription`, `description`,
`variantLabel`, `sizeMl`, and `featured`. These allow confirmed corrections
without changing the source-image mapping.

Set these values in `backend/.env` (never in a tracked file):

```dotenv
CATALOG_API_URL=https://your-store.example
CATALOG_ADMIN_EMAIL=your-admin-email
CATALOG_ADMIN_PASSWORD=your-admin-password
```

An ignored `backend/.env.catalog.local` file may also hold these values.
Existing `ADMIN_EMAIL` and `ADMIN_PASSWORD` are used if the catalog-specific
credentials are absent. The uploader does not need a direct database
connection. The website's backend must be running with working database and
upload storage.

```powershell
node node_modules/ts-node/dist/bin.js scripts/upload-ayla-catalog.ts --dry-run
node node_modules/ts-node/dist/bin.js scripts/upload-ayla-catalog.ts --apply
```

The dry run validates the files and selected commercial data without sending
network requests. Apply skips existing product slugs and category slugs:
it does not delete records, replace existing images, change existing prices,
reset stock, or run the destructive database seed. An existing slug with
different content must be reviewed in the admin panel.

`upload-result.json` records created product IDs and image URLs. If a batch is
interrupted, rerun it: already-created products are skipped. An interruption
between the image upload and product creation can leave an unused image in
storage; no existing media is automatically deleted.

Only `--apply` sends data to the website. Preparing files or running a dry run
does **not** add the products to the live store.

## Products awaiting owner pricing

The owner explicitly requested that products be entered before prices and
stock are supplied. The current schema requires numeric values, so this mode
creates all entries with price and stock set to zero:

```powershell
node node_modules/ts-node/dist/bin.js scripts/upload-ayla-catalog.ts --apply --pending-pricing
```

Zero values are placeholders for the owner to edit in the admin panel. They
are not actual selling prices or confirmed inventory. Existing products are
still skipped, so a repeat run cannot erase prices or stock entered later.

To upload only images and missing Arabic categories without creating any
products, use `--apply --stage-media`. Uploaded image URLs are saved in
`uploaded-images.json` and reused after verifying the stored bytes.
