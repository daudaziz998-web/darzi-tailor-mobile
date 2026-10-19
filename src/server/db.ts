import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// @ts-ignore
var __filename = fileURLToPath(import.meta.url);
// @ts-ignore
var __dirname = path.dirname(__filename);

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let dbFilePath = '';
let dbDirectoryPath = '';

/**
 * Automatically detects the currently logged-in user's AppData/Roaming directory.
 * Windows Production: C:\Users\<WindowsUser>\AppData\Roaming\Awais Tailor House\tailor.db
 * Linux/Cloud: ~/.config/Awais Tailor House/tailor.db
 */
export function getDatabaseLocations(): { dir: string; filePath: string } {
  // If Electron passes the proper userData path via process.env.USER_DATA_PATH
  let appDir = process.env.USER_DATA_PATH;

  if (!appDir) {
    let baseDir = process.env.APPDATA;
    if (!baseDir) {
      if (process.platform === 'win32') {
        baseDir = path.join(os.homedir(), 'AppData', 'Roaming');
      } else {
        // In Linux or container environments, use ~/.config or ~/.local/share
        baseDir = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
      }
    }
    appDir = path.join(baseDir, 'Awais Tailor House');
  }

  if (!fs.existsSync(appDir)) {
    try {
      fs.mkdirSync(appDir, { recursive: true });
    } catch (e) {
      console.warn('Could not create appDir in roaming, falling back to temp dir', e);
      appDir = path.join(os.tmpdir(), 'Awais Tailor House');
      fs.mkdirSync(appDir, { recursive: true });
    }
  }

  const file = path.join(appDir, 'tailor.db');
  return { dir: appDir, filePath: file };
}

/**
 * Saves current in-memory SQLite database state to tailor.db on disk
 */
export function saveDatabaseToDisk(): void {
  if (!db || !dbFilePath) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFilePath, buffer);
  } catch (err) {
    console.error('Failed to write SQLite database to disk:', err);
  }
}

/**
 * Initializes SQLite database with relational tables and default seed data
 */
export async function initializeDatabase(): Promise<{ db: Database; filePath: string; dir: string }> {
  if (db) {
    return { db, filePath: dbFilePath, dir: dbDirectoryPath };
  }

  const locations = getDatabaseLocations();
  dbDirectoryPath = locations.dir;
  dbFilePath = locations.filePath;

  // Locate sql-wasm.wasm reliably in development, esbuild bundles, and packaged ASAR
  SQL = await initSqlJs({
    locateFile: (file) => {
      const candidates = [
        path.join(__dirname, file),
        path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', file),
        path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file),
        path.join(process.cwd(), 'dist-electron', file),
        path.join((process as any).resourcesPath || '', file),
        path.join((process as any).resourcesPath || '', 'app.asar.unpacked', file),
      ];
      for (const candidate of candidates) {
        try {
          if (fs.existsSync(candidate)) {
            return candidate;
          }
        } catch (_) {}
      }
      return file;
    },
  });

  if (fs.existsSync(dbFilePath)) {
    try {
      const fileBuffer = fs.readFileSync(dbFilePath);
      db = new SQL.Database(fileBuffer);
      console.log(`[SQLite] Loaded existing SQLite database from: ${dbFilePath}`);
    } catch (err) {
      console.error('[SQLite] Corrupted DB file, creating fresh database:', err);
      db = new SQL.Database();
    }
  } else {
    console.log(`[SQLite] Creating new SQLite database at: ${dbFilePath}`);
    db = new SQL.Database();
  }

  // Create Relational SQLite Tables
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      shop_name_en TEXT NOT NULL,
      shop_name_ur TEXT NOT NULL,
      location TEXT NOT NULL,
      phone TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'Rs.',
      unit TEXT NOT NULL DEFAULT 'inches',
      language TEXT NOT NULL DEFAULT 'en',
      thermal_width TEXT NOT NULL DEFAULT '80mm',
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS measurements (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      date TEXT NOT NULL,
      title TEXT,
      neck TEXT DEFAULT '',
      chest TEXT DEFAULT '',
      waist TEXT DEFAULT '',
      hip TEXT DEFAULT '',
      total_length TEXT DEFAULT '',
      sleeve_length TEXT DEFAULT '',
      bottom TEXT DEFAULT '',
      shoulder TEXT DEFAULT '',
      back_width TEXT DEFAULT '',
      upper_arm TEXT DEFAULT '',
      lower_arm TEXT DEFAULT '',
      wrist TEXT DEFAULT '',
      cuff TEXT DEFAULT '',
      delivery_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS custom_measurements (
      id TEXT PRIMARY KEY,
      measurement_id TEXT NOT NULL,
      name TEXT NOT NULL,
      value TEXT NOT NULL,
      unit TEXT DEFAULT 'inches',
      notes TEXT DEFAULT '',
      FOREIGN KEY (measurement_id) REFERENCES measurements(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      measurement_id TEXT,
      order_summary TEXT NOT NULL,
      total_price REAL NOT NULL DEFAULT 0,
      previous_balance REAL NOT NULL DEFAULT 0,
      total_due REAL NOT NULL DEFAULT 0,
      paid_amount REAL NOT NULL DEFAULT 0,
      remaining_amount REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS clothing_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      clothing_type TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      special_instructions TEXT DEFAULT '',
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL DEFAULT 'cash',
      date TEXT NOT NULL,
      note TEXT DEFAULT '',
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS prices (
      id TEXT PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_ur TEXT NOT NULL,
      default_price REAL NOT NULL,
      category TEXT NOT NULL DEFAULT 'men'
    );

    CREATE TABLE IF NOT EXISTS custom_measurement_definitions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_ur TEXT DEFAULT '',
      unit TEXT NOT NULL DEFAULT 'Inches',
      image TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT
    );
  `);

  // Migrate existing orders table if columns are missing
  try {
    db.run("ALTER TABLE orders ADD COLUMN previous_balance REAL NOT NULL DEFAULT 0");
  } catch (_) {}
  try {
    db.run("ALTER TABLE orders ADD COLUMN total_due REAL NOT NULL DEFAULT 0");
  } catch (_) {}

  // Migrate existing measurements table if handwritten slip columns are missing
  const measCols = [
    "ALTER TABLE measurements ADD COLUMN daman_style TEXT DEFAULT 'simple'",
    "ALTER TABLE measurements ADD COLUMN cuff_style TEXT DEFAULT 'simple'",
    "ALTER TABLE measurements ADD COLUMN collar_style TEXT DEFAULT 'ban'",
    "ALTER TABLE measurements ADD COLUMN collar_patti_style TEXT DEFAULT 'simple'",
    "ALTER TABLE measurements ADD COLUMN selected_color TEXT DEFAULT ''",
    "ALTER TABLE measurements ADD COLUMN shalwar_pocket TEXT DEFAULT 'no'",
    "ALTER TABLE measurements ADD COLUMN front_pocket TEXT DEFAULT 'yes'",
    "ALTER TABLE measurements ADD COLUMN side_pocket TEXT DEFAULT 'one'",
    "ALTER TABLE measurements ADD COLUMN coat_style TEXT DEFAULT 'none'",
    "ALTER TABLE measurements ADD COLUMN button_type TEXT DEFAULT 'simple'",
    "ALTER TABLE measurements ADD COLUMN shalwar TEXT DEFAULT ''",
    "ALTER TABLE measurements ADD COLUMN tira TEXT DEFAULT ''",
    "ALTER TABLE measurements ADD COLUMN collar TEXT DEFAULT ''",
    "ALTER TABLE measurements ADD COLUMN chati TEXT DEFAULT ''",
    "ALTER TABLE measurements ADD COLUMN chodai TEXT DEFAULT ''",
    "ALTER TABLE measurements ADD COLUMN ghera TEXT DEFAULT ''",
    "ALTER TABLE measurements ADD COLUMN paancha TEXT DEFAULT ''",
  ];
  for (const colSql of measCols) {
    try {
      db.run(colSql);
    } catch (_) {}
  }

  // Check if custom_measurement_definitions table has entries; seed sample definition if empty
  try {
    const checkCustomDefs = db.exec("SELECT COUNT(*) as count FROM custom_measurement_definitions");
    const defCount = checkCustomDefs[0]?.values[0]?.[0] as number;
    if (!defCount) {
      const nowIso = new Date().toISOString();
      db.run(
        `INSERT OR IGNORE INTO custom_measurement_definitions (id, name, name_ur, unit, image, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['cmd-1', 'Total Arm Length', 'کل بازو کی لمبائی', 'Inches', '', nowIso, nowIso]
      );
    }
  } catch (_) {}

  // Check if settings table has entry
  const checkSettings = db.exec("SELECT COUNT(*) as count FROM settings");
  const count = checkSettings[0]?.values[0]?.[0] as number;
  if (!count) {
    seedInitialData(db);
  }

  saveDatabaseToDisk();
  return { db, filePath: dbFilePath, dir: dbDirectoryPath };
}

export function seedInitialData(database: Database) {
  const now = new Date().toISOString();
  const today = now.split('T')[0];

  // 1. Settings (Awais Tailor House, Talash, Shamshi Khan)
  database.run(
    `INSERT INTO settings (id, shop_name_en, shop_name_ur, location, phone, currency, unit, language, thermal_width, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'default',
      'Awais Tailor House',
      'اویس ٹیلر ہاؤس',
      'Talash, Shamshi Khan',
      '0300-1234567',
      'Rs.',
      'inches',
      'en',
      '80mm',
      now
    ]
  );

  // 2. Standard Prices
  const defaultPrices = [
    ['price-1', 'Shalwar Kameez', 'شلوار قمیض', 1500, 'men'],
    ['price-2', 'Pant Shirt', 'پینٹ شرٹ', 1200, 'men'],
    ['price-3', 'Waistcoat', 'واسکوٹ', 1000, 'men'],
    ['price-4', 'Kurta', 'کرتہ', 900, 'men'],
    ['price-5', 'Shalwar Only', 'صرف شلوار', 600, 'general'],
    ['price-6', 'Kameez Only', 'صرف قمیض', 800, 'general'],
    ['price-7', 'Safari Suit', 'سفاری سوٹ', 2500, 'men'],
    ['price-8', 'Coat / Blazer', 'کوٹ / شیروانی', 4000, 'men'],
  ];

  for (const p of defaultPrices) {
    database.run(
      `INSERT INTO prices (id, name_en, name_ur, default_price, category) VALUES (?, ?, ?, ?, ?)`,
      p
    );
  }

  // 3. Sample Customers
  database.run(
    `INSERT INTO customers (id, name, phone, address, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['cust-1', 'Muhammad Ali', '0300 7891234', 'Talash Bazaar, Shamshi Khan', 'Regular customer, prefers loose comfort fit', '2026-08-10', now]
  );
  database.run(
    `INSERT INTO customers (id, name, phone, address, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['cust-2', 'Tariq Mahmood', '0321 4567890', 'Main Road, Shamshi Khan', 'Likes stiff collar and concealed front buttons', '2026-09-05', now]
  );
  database.run(
    `INSERT INTO customers (id, name, phone, address, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['cust-3', 'Usman Ghani', '0333 9876543', 'Near Jamia Masjid, Talash', 'Prefers slim fit kurtas and narrow bottom', '2026-09-22', now]
  );

  // 4. Sample Measurements using the exact 13 fields
  database.run(
    `INSERT INTO measurements (
      id, customer_id, date, title,
      neck, chest, waist, hip, total_length, sleeve_length, bottom, shoulder,
      back_width, upper_arm, lower_arm, wrist, cuff, delivery_date, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'meas-1',
      'cust-1',
      '2026-10-02',
      'Winter Shalwar Kameez Fitting',
      '16', '42', '38', '40', '42.5', '24', '16', '18',
      '17.5', '14', '11.5', '8.5', '9.5', '2026-10-10', 'Double cuff, soft ban collar', now
    ]
  );

  // Sample Custom Measurement
  database.run(
    `INSERT INTO custom_measurements (id, measurement_id, name, value, unit, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['cm-1', 'meas-1', 'Pocket Depth', '8', 'inches', 'Deep front pocket']
  );
  database.run(
    `INSERT INTO custom_measurements (id, measurement_id, name, value, unit, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['cm-2', 'meas-1', 'Collar Style', 'Sherwani Ban', 'type', 'Stiff buckram']
  );

  // Historical Measurement for customer 1
  database.run(
    `INSERT INTO measurements (
      id, customer_id, date, title,
      neck, chest, waist, hip, total_length, sleeve_length, bottom, shoulder,
      back_width, upper_arm, lower_arm, wrist, cuff, delivery_date, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'meas-2',
      'cust-1',
      '2026-08-12',
      'Summer Cotton Kurta',
      '16', '41.5', '37.5', '39.5', '42', '24', '16', '18',
      '17', '13.5', '11', '8.5', '9', '2026-08-20', 'Summer lawn fabric', now
    ]
  );

  // 5. Sample Order & Clothing Items
  database.run(
    `INSERT INTO orders (id, customer_id, measurement_id, order_summary, total_price, previous_balance, total_due, paid_amount, remaining_amount, status, date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['ord-1', 'cust-1', 'meas-1', '1x Pant Shirt', 1200, 2000, 3200, 0, 3200, 'pending', '2026-10-02', now]
  );

  database.run(
    `INSERT INTO clothing_items (id, order_id, clothing_type, quantity, price, total, special_instructions)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['ci-1', 'ord-1', 'Pant Shirt', 1, 1200, 1200, 'Cotton fabric, formal cut']
  );

  database.run(
    `INSERT INTO orders (id, customer_id, measurement_id, order_summary, total_price, paid_amount, remaining_amount, status, date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['ord-2', 'cust-2', 'meas-2', '1x Shalwar Kameez + 1x Waistcoat', 2500, 1000, 1500, 'partial', '2026-09-28', now]
  );

  database.run(
    `INSERT INTO clothing_items (id, order_id, clothing_type, quantity, price, total, special_instructions)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['ci-2', 'ord-2', 'Shalwar Kameez', 1, 1500, 1500, 'Cream fabric']
  );
  database.run(
    `INSERT INTO clothing_items (id, order_id, clothing_type, quantity, price, total, special_instructions)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['ci-3', 'ord-2', 'Waistcoat', 1, 1000, 1000, 'Brass buttons']
  );

  database.run(
    `INSERT INTO payments (id, order_id, customer_id, amount, method, date, note)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['pay-2', 'ord-2', 'cust-2', 1000, 'jazzcash', '2026-09-28', 'JazzCash deposit']
  );

  database.run(
    `INSERT OR IGNORE INTO custom_measurement_definitions (id, name, name_ur, unit, image, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['cmd-1', 'Total Arm Length', 'کل بازو کی لمبائی', 'Inches', '', now, now]
  );
}
