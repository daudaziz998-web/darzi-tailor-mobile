import express from 'express';
import http from 'http';
import { initializeDatabase, saveDatabaseToDisk, getDatabaseLocations, seedInitialData } from './src/server/db';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// @ts-ignore
var __filename = fileURLToPath(import.meta.url);
// @ts-ignore
var __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  // Dev server must always bind to port 3000 (per environment constraints and Electron config)
  const PORT = 3000;

  app.use(express.json());

  // Enable CORS for packaged Electron (file:// protocol) API requests
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Initialize SQLite database in Windows AppData/Roaming or user config dir
  const { db, filePath, dir } = await initializeDatabase();
  console.log(`[Awais Tailor House] SQLite database initialized at: ${filePath}`);

  // Helpers to convert sql.js exec results to array of objects
  const queryAll = (sql: string, params: any[] = []): any[] => {
    const stmt = db.prepare(sql);
    if (params.length > 0) stmt.bind(params);
    const results: any[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  };

  const queryOne = (sql: string, params: any[] = []): any | null => {
    const all = queryAll(sql, params);
    return all.length > 0 ? all[0] : null;
  };

  // --- API Routes ---

  // 1. Health & Database Info
  app.get('/api/db-info', (req, res) => {
    res.json({
      status: 'connected',
      engine: 'SQLite 3 (Relational)',
      filePath,
      directory: dir,
      exists: fs.existsSync(filePath),
      sizeBytes: fs.existsSync(filePath) ? fs.statSync(filePath).size : 0,
    });
  });

  // 2. Full Bootstrap Data
  app.get('/api/bootstrap', (req, res) => {
    try {
      const settings = queryOne('SELECT * FROM settings WHERE id = "default"') || {
        shop_name_en: 'Awais Tailor House',
        shop_name_ur: 'اویس ٹیلر ہاؤس',
        location: 'Talash, Shamshi Khan',
        phone: '0300-1234567',
        currency: 'Rs.',
        unit: 'inches',
        language: 'en',
        thermal_width: '80mm',
      };

      const customers = queryAll('SELECT * FROM customers ORDER BY created_at DESC');
      const measurements = queryAll('SELECT * FROM measurements ORDER BY date DESC, created_at DESC');
      const customMeasurements = queryAll('SELECT * FROM custom_measurements');
      const orders = queryAll('SELECT * FROM orders ORDER BY date DESC, created_at DESC');
      const clothingItems = queryAll('SELECT * FROM clothing_items');
      const payments = queryAll('SELECT * FROM payments ORDER BY date DESC');
      const prices = queryAll('SELECT * FROM prices');
      const customMeasurementDefinitions = queryAll(
        'SELECT * FROM custom_measurement_definitions ORDER BY created_at ASC'
      );

      res.json({
        success: true,
        settings,
        customers,
        measurements,
        customMeasurements,
        orders,
        clothingItems,
        payments,
        prices,
        customMeasurementDefinitions,
        dbPath: filePath,
      });
    } catch (err: any) {
      console.error('Error in /api/bootstrap:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Customer Routes
  app.post('/api/customers', (req, res) => {
    try {
      const { id, name, phone, address, notes } = req.body;
      const custId = id || 'cust-' + Date.now();
      const now = new Date().toISOString();

      const existing = queryOne('SELECT id FROM customers WHERE id = ?', [custId]);
      if (existing) {
        db.run(
          `UPDATE customers SET name = ?, phone = ?, address = ?, notes = ?, updated_at = ? WHERE id = ?`,
          [name, phone, address || '', notes || '', now, custId]
        );
      } else {
        db.run(
          `INSERT INTO customers (id, name, phone, address, notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [custId, name, phone, address || '', notes || '', now.split('T')[0], now]
        );
      }

      saveDatabaseToDisk();
      const customer = queryOne('SELECT * FROM customers WHERE id = ?', [custId]);
      res.json({ success: true, customer });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/customers/:id', (req, res) => {
    try {
      const { id } = req.params;
      db.run('DELETE FROM customers WHERE id = ?', [id]);
      db.run('DELETE FROM measurements WHERE customer_id = ?', [id]);
      db.run('DELETE FROM orders WHERE customer_id = ?', [id]);
      saveDatabaseToDisk();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Measurement Routes
  app.post('/api/measurements', (req, res) => {
    try {
      const {
        id,
        orderId: requestedOrderId,
        isNewOrder,
        previousBalance: reqPreviousBalance,
        totalDue: reqTotalDue,
        customerId,
        date,
        title,
        neck,
        chest,
        waist,
        hip,
        totalLength,
        sleeveLength,
        bottom,
        shoulder,
        backWidth,
        upperArm,
        lowerArm,
        wrist,
        cuff,
        deliveryDate,
        notes,
        damanStyle,
        cuffStyle,
        collarPattiStyle,
        selectedColor,
        shalwarPocket,
        frontPocket,
        sidePocket,
        coatStyle,
        buttonType,
        shalwar,
        tira,
        collar,
        chati,
        chodai,
        ghera,
        paancha,
        customMeasurements,
        clothingItems,
        advancePayment,
        paymentMethod
      } = req.body;

      const measId = id || 'meas-' + Date.now();
      const now = new Date().toISOString();
      const today = date || now.split('T')[0];

      // Reconcile primary measurements with traditional Pakistani terms
      const effLength = totalLength || req.body.lambai || '';
      const effSleeve = sleeveLength || req.body.bazu || '';
      const effTira = tira || shoulder || '';
      const effCollar = collar || neck || '';
      const effChati = chati || chest || '';
      const effChodai = chodai || waist || '';
      const effGhera = ghera || backWidth || '';
      const effBottom = bottom || paancha || '';

      const effCollarStyle = req.body.collarStyle || req.body.collar_style || (collarPattiStyle === 'color' || collarPattiStyle === 'pencil' ? 'ban' : collarPattiStyle) || 'ban';

      const existing = queryOne('SELECT id FROM measurements WHERE id = ?', [measId]);
      if (existing) {
        db.run(
          `UPDATE measurements SET
            date = ?, title = ?, neck = ?, chest = ?, waist = ?, hip = ?,
            total_length = ?, sleeve_length = ?, bottom = ?, shoulder = ?,
            back_width = ?, upper_arm = ?, lower_arm = ?, wrist = ?, cuff = ?,
            delivery_date = ?, notes = ?,
            daman_style = ?, cuff_style = ?, collar_style = ?, collar_patti_style = ?, selected_color = ?,
            shalwar_pocket = ?, front_pocket = ?, side_pocket = ?, coat_style = ?,
            button_type = ?, shalwar = ?, tira = ?, collar = ?, chati = ?, chodai = ?, ghera = ?, paancha = ?
           WHERE id = ?`,
          [
            today, title || '', effCollar, effChati, effChodai, hip || '',
            effLength, effSleeve, effBottom, effTira,
            effGhera, upperArm || '', lowerArm || '', wrist || '', cuff || '',
            deliveryDate || '', notes || '',
            damanStyle || 'simple', cuffStyle || 'simple', effCollarStyle, collarPattiStyle || 'simple', selectedColor || '',
            shalwarPocket || 'no', frontPocket || 'yes', sidePocket || 'one', coatStyle || 'none',
            buttonType || 'simple', shalwar || '', effTira, effCollar, effChati, effChodai, effGhera, effBottom,
            measId
          ]
        );
      } else {
        db.run(
          `INSERT INTO measurements (
            id, customer_id, date, title,
            neck, chest, waist, hip, total_length, sleeve_length, bottom, shoulder,
            back_width, upper_arm, lower_arm, wrist, cuff, delivery_date, notes, created_at,
            daman_style, cuff_style, collar_style, collar_patti_style, selected_color,
            shalwar_pocket, front_pocket, side_pocket, coat_style,
            button_type, shalwar, tira, collar, chati, chodai, ghera, paancha
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            measId, customerId, today, title || '',
            effCollar, effChati, effChodai, hip || '', effLength, effSleeve, effBottom, effTira,
            effGhera, upperArm || '', lowerArm || '', wrist || '', cuff || '',
            deliveryDate || '', notes || '', now,
            damanStyle || 'simple', cuffStyle || 'simple', effCollarStyle, collarPattiStyle || 'simple', selectedColor || '',
            shalwarPocket || 'no', frontPocket || 'yes', sidePocket || 'one', coatStyle || 'none',
            buttonType || 'simple', shalwar || '', effTira, effCollar, effChati, effChodai, effGhera, effBottom
          ]
        );
      }

      // Handle Custom Measurements
      db.run('DELETE FROM custom_measurements WHERE measurement_id = ?', [measId]);
      if (Array.isArray(customMeasurements)) {
        for (const cm of customMeasurements) {
          if (cm.name && cm.name.trim()) {
            let cmId = cm.id;
            if (cmId) {
              const taken = queryOne('SELECT measurement_id FROM custom_measurements WHERE id = ?', [cmId]);
              if (taken && taken.measurement_id !== measId) {
                cmId = null; // ID belongs to another record, generate fresh ID
              }
            }
            if (!cmId) {
              cmId = 'cm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
            }
            db.run(
              `INSERT OR REPLACE INTO custom_measurements (id, measurement_id, name, value, unit, notes)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                cmId,
                measId,
                cm.name.trim(),
                cm.value || '',
                cm.unit || 'inches',
                cm.notes || ''
              ]
            );
          }
        }
      }

      // Handle Clothing Items & Order
      let orderTotal = 0;
      let finalOrderId = '';
      if (Array.isArray(clothingItems) && clothingItems.length > 0) {
        orderTotal = clothingItems.reduce((sum: number, it: any) => sum + (Number(it.total) || 0), 0);
        
        // Find if an existing order is linked to this measurement when not creating a separate new order
        const linkedExisting = requestedOrderId 
          ? queryOne('SELECT id FROM orders WHERE id = ?', [requestedOrderId])
          : (!isNewOrder ? queryOne('SELECT id FROM orders WHERE measurement_id = ?', [measId]) : null);

        finalOrderId = isNewOrder 
          ? ('ord-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6))
          : (linkedExisting ? linkedExisting.id : (requestedOrderId || ('ord-' + measId)));
          
        const summary = clothingItems.map((ci: any) => `${ci.quantity}x ${ci.clothingType || ci.itemName}`).join(', ');

        const prevBal = Number(reqPreviousBalance) || 0;
        const totalDue = reqTotalDue !== undefined && reqTotalDue !== null ? Number(reqTotalDue) : (orderTotal + prevBal);
        const adv = Number(advancePayment) || 0;
        const rem = Math.max(0, totalDue - adv);
        const status = rem === 0 ? 'paid' : adv > 0 ? 'partial' : 'pending';

        // Upsert order
        const existingOrder = queryOne('SELECT id FROM orders WHERE id = ?', [finalOrderId]);
        if (existingOrder) {
          db.run(
            `UPDATE orders SET
              order_summary = ?, total_price = ?, previous_balance = ?, total_due = ?, paid_amount = ?, remaining_amount = ?, status = ?, date = ?
             WHERE id = ?`,
            [summary, orderTotal, prevBal, totalDue, adv, rem, status, today, finalOrderId]
          );
        } else {
          db.run(
            `INSERT INTO orders (id, customer_id, measurement_id, order_summary, total_price, previous_balance, total_due, paid_amount, remaining_amount, status, date, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [finalOrderId, customerId, measId, summary, orderTotal, prevBal, totalDue, adv, rem, status, today, now]
          );
        }

        // When a new order carries forward previous balance, mark previous orders for this customer as rolled forward (remaining_amount = 0, status = 'paid')
        if (isNewOrder && prevBal > 0) {
          db.run(
            `UPDATE orders SET remaining_amount = 0, status = 'paid' WHERE customer_id = ? AND id != ? AND remaining_amount > 0`,
            [customerId, finalOrderId]
          );
        }

        // Upsert clothing items
        db.run('DELETE FROM clothing_items WHERE order_id = ?', [finalOrderId]);
        for (const ci of clothingItems) {
          let ciId = ci.id;
          if (ciId) {
            const taken = queryOne('SELECT order_id FROM clothing_items WHERE id = ?', [ciId]);
            if (taken && taken.order_id !== finalOrderId) {
              ciId = null; // Belongs to another order, generate fresh ID
            }
          }
          if (!ciId) {
            ciId = 'ci-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
          }
          db.run(
            `INSERT OR REPLACE INTO clothing_items (id, order_id, clothing_type, quantity, price, total, special_instructions)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              ciId,
              finalOrderId,
              ci.clothingType || ci.itemName || 'Garment',
              ci.quantity || 1,
              ci.price || ci.unitPrice || 0,
              ci.total || (ci.quantity * ci.price) || 0,
              ci.specialInstructions || ''
            ]
          );
        }

        if (adv > 0) {
          db.run(
            `INSERT INTO payments (id, order_id, customer_id, amount, method, date, note)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['pay-' + Date.now(), finalOrderId, customerId, adv, paymentMethod || 'cash', today, 'Advance payment']
          );
        }
      }

      saveDatabaseToDisk();

      res.json({
        success: true,
        measurementId: measId,
        orderId: finalOrderId,
        message: 'Measurement and order successfully saved'
      });
    } catch (err: any) {
      console.error('Error saving measurement:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete measurement
  app.delete('/api/measurements/:id', (req, res) => {
    try {
      const { id } = req.params;
      db.run('DELETE FROM measurements WHERE id = ?', [id]);
      db.run('DELETE FROM custom_measurements WHERE measurement_id = ?', [id]);
      db.run('DELETE FROM orders WHERE measurement_id = ?', [id]);
      saveDatabaseToDisk();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Payment Routes
  app.post('/api/payments', (req, res) => {
    try {
      const { orderId, customerId, amount, method, note, date } = req.body;
      const amt = Number(amount);
      const payDate = date || new Date().toISOString().split('T')[0];

      const order = queryOne('SELECT * FROM orders WHERE id = ?', [orderId]);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      const totalTarget = (order.total_due && order.total_due > 0) ? order.total_due : order.total_price;
      const newPaid = (order.paid_amount || 0) + amt;
      const newRemaining = Math.max(0, (totalTarget || 0) - newPaid);
      const newStatus = newRemaining === 0 ? 'paid' : newPaid > 0 ? 'partial' : 'pending';

      db.run(
        `UPDATE orders SET paid_amount = ?, remaining_amount = ?, status = ? WHERE id = ?`,
        [newPaid, newRemaining, newStatus, orderId]
      );

      const payId = 'pay-' + Date.now();
      db.run(
        `INSERT INTO payments (id, order_id, customer_id, amount, method, date, note)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [payId, orderId, customerId, amt, method || 'cash', payDate, note || '']
      );

      saveDatabaseToDisk();
      res.json({ success: true, paymentId: payId, newPaid, newRemaining, newStatus });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Price Management Routes
  app.post('/api/prices', (req, res) => {
    try {
      const { id, nameEn, nameUr, defaultPrice, category } = req.body;
      const priceId = id || 'price-' + Date.now();
      db.run(
        `INSERT INTO prices (id, name_en, name_ur, default_price, category) VALUES (?, ?, ?, ?, ?)`,
        [priceId, nameEn, nameUr, Number(defaultPrice) || 0, category || 'men']
      );
      saveDatabaseToDisk();
      res.json({ success: true, id: priceId });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/prices/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { nameEn, nameUr, defaultPrice, category } = req.body;
      db.run(
        `UPDATE prices SET name_en = ?, name_ur = ?, default_price = ?, category = ? WHERE id = ?`,
        [nameEn, nameUr, Number(defaultPrice) || 0, category || 'men', id]
      );
      saveDatabaseToDisk();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/prices/:id', (req, res) => {
    try {
      const { id } = req.params;
      db.run('DELETE FROM prices WHERE id = ?', [id]);
      saveDatabaseToDisk();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6.5. Custom Measurement Definitions Routes
  app.post('/api/custom-measurement-definitions', (req, res) => {
    try {
      const { id, name, nameUr, unit, image } = req.body;
      const defId = id || 'cmd-' + Date.now();
      const now = new Date().toISOString();

      const existing = queryOne('SELECT id FROM custom_measurement_definitions WHERE id = ?', [defId]);
      if (existing) {
        db.run(
          `UPDATE custom_measurement_definitions SET name = ?, name_ur = ?, unit = ?, image = ?, updated_at = ? WHERE id = ?`,
          [name, nameUr || '', unit || 'Inches', image || '', now, defId]
        );
      } else {
        db.run(
          `INSERT INTO custom_measurement_definitions (id, name, name_ur, unit, image, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [defId, name, nameUr || '', unit || 'Inches', image || '', now, now]
        );
      }
      saveDatabaseToDisk();
      const definition = queryOne('SELECT * FROM custom_measurement_definitions WHERE id = ?', [defId]);
      res.json({ success: true, definition });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/custom-measurement-definitions/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { name, nameUr, unit, image } = req.body;
      const now = new Date().toISOString();
      db.run(
        `UPDATE custom_measurement_definitions SET name = ?, name_ur = ?, unit = ?, image = ?, updated_at = ? WHERE id = ?`,
        [name, nameUr || '', unit || 'Inches', image || '', now, id]
      );
      saveDatabaseToDisk();
      const definition = queryOne('SELECT * FROM custom_measurement_definitions WHERE id = ?', [id]);
      res.json({ success: true, definition });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/custom-measurement-definitions/:id', (req, res) => {
    try {
      const { id } = req.params;
      // CRITICAL: Only delete definition template. Do NOT delete or corrupt past customer records!
      db.run('DELETE FROM custom_measurement_definitions WHERE id = ?', [id]);
      saveDatabaseToDisk();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Settings Route
  app.post('/api/settings', (req, res) => {
    try {
      const {
        shopNameEn,
        shopNameUr,
        location,
        phone,
        currency,
        unit,
        language,
        thermalWidth
      } = req.body;

      const now = new Date().toISOString();

      db.run(
        `UPDATE settings SET
          shop_name_en = ?, shop_name_ur = ?, location = ?, phone = ?,
          currency = ?, unit = ?, language = ?, thermal_width = ?, updated_at = ?
         WHERE id = 'default'`,
        [
          shopNameEn || 'Awais Tailor House',
          shopNameUr || 'اویس ٹیلر ہاؤس',
          location || 'Talash, Shamshi Khan',
          phone || '0300-1234567',
          currency || 'Rs.',
          unit || 'inches',
          language || 'en',
          thermalWidth || '80mm',
          now
        ]
      );

      saveDatabaseToDisk();
      const updated = queryOne('SELECT * FROM settings WHERE id = "default"');
      res.json({ success: true, settings: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. Reset Route
  app.post('/api/reset', async (req, res) => {
    try {
      db.run('DELETE FROM custom_measurement_definitions');
      db.run('DELETE FROM custom_measurements');
      db.run('DELETE FROM clothing_items');
      db.run('DELETE FROM payments');
      db.run('DELETE FROM orders');
      db.run('DELETE FROM measurements');
      db.run('DELETE FROM customers');
      db.run('DELETE FROM prices');
      db.run('DELETE FROM settings');

      // Re-seed initial data
      seedInitialData(db);
      saveDatabaseToDisk();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 9. Backup & Restore Routes
  app.get('/api/backup', (req, res) => {
    try {
      const settings = queryAll('SELECT * FROM settings');
      const customers = queryAll('SELECT * FROM customers');
      const measurements = queryAll('SELECT * FROM measurements');
      const customMeasurements = queryAll('SELECT * FROM custom_measurements');
      const orders = queryAll('SELECT * FROM orders');
      const clothingItems = queryAll('SELECT * FROM clothing_items');
      const payments = queryAll('SELECT * FROM payments');
      const prices = queryAll('SELECT * FROM prices');
      const customMeasurementDefinitions = queryAll('SELECT * FROM custom_measurement_definitions');

      const backup = {
        version: '1.0',
        app: 'Awais Tailor House',
        exportDate: new Date().toISOString(),
        data: {
          settings,
          customers,
          measurements,
          customMeasurements,
          orders,
          clothingItems,
          payments,
          prices,
          customMeasurementDefinitions,
        },
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=awais-tailor-backup-${new Date().toISOString().split('T')[0]}.json`
      );
      res.json(backup);
    } catch (err: any) {
      console.error('Error generating backup:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/restore', (req, res) => {
    try {
      const payload = req.body;
      const backupData = payload.data || payload;

      if (!backupData || (!backupData.customers && !backupData.settings)) {
        return res.status(400).json({ success: false, error: 'Invalid backup file format' });
      }

      // 1. Settings
      if (Array.isArray(backupData.settings) && backupData.settings.length > 0) {
        db.run('DELETE FROM settings');
        for (const s of backupData.settings) {
          db.run(
            `INSERT INTO settings (id, shop_name_en, shop_name_ur, location, phone, currency, unit, language, thermal_width, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [s.id, s.shop_name_en, s.shop_name_ur, s.location, s.phone, s.currency || 'Rs.', s.unit || 'inches', s.language || 'en', s.thermal_width || '80mm', s.updated_at]
          );
        }
      }

      // 2. Customers
      if (Array.isArray(backupData.customers)) {
        db.run('DELETE FROM customers');
        for (const c of backupData.customers) {
          db.run(
            `INSERT INTO customers (id, name, phone, address, notes, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [c.id, c.name, c.phone, c.address || '', c.notes || '', c.created_at, c.updated_at || '']
          );
        }
      }

      // 3. Measurements
      if (Array.isArray(backupData.measurements)) {
        db.run('DELETE FROM measurements');
        for (const m of backupData.measurements) {
          db.run(
            `INSERT INTO measurements (
              id, customer_id, date, title, neck, chest, waist, hip, total_length, sleeve_length, bottom,
              shoulder, back_width, upper_arm, lower_arm, wrist, cuff, delivery_date, notes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              m.id, m.customer_id, m.date, m.title || '', m.neck || '', m.chest || '', m.waist || '', m.hip || '',
              m.total_length || '', m.sleeve_length || '', m.bottom || '', m.shoulder || '', m.back_width || '',
              m.upper_arm || '', m.lower_arm || '', m.wrist || '', m.cuff || '', m.delivery_date || '', m.notes || '', m.created_at || ''
            ]
          );
        }
      }

      // 4. Custom Measurements
      if (Array.isArray(backupData.customMeasurements)) {
        db.run('DELETE FROM custom_measurements');
        for (const cm of backupData.customMeasurements) {
          db.run(
            `INSERT INTO custom_measurements (id, measurement_id, name, value, unit, notes)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [cm.id, cm.measurement_id, cm.name, cm.value, cm.unit || 'inches', cm.notes || '']
          );
        }
      }

      // 5. Orders
      if (Array.isArray(backupData.orders)) {
        db.run('DELETE FROM orders');
        for (const o of backupData.orders) {
          db.run(
            `INSERT INTO orders (id, customer_id, measurement_id, order_summary, total_price, previous_balance, total_due, paid_amount, remaining_amount, status, date, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              o.id, o.customer_id, o.measurement_id || null, o.order_summary,
              Number(o.total_price) || 0, Number(o.previous_balance) || 0,
              Number(o.total_due) || (Number(o.total_price) + (Number(o.previous_balance) || 0)),
              Number(o.paid_amount) || 0, Number(o.remaining_amount) || 0,
              o.status || 'pending', o.date, o.created_at || ''
            ]
          );
        }
      }

      // 6. Clothing items
      if (Array.isArray(backupData.clothingItems)) {
        db.run('DELETE FROM clothing_items');
        for (const ci of backupData.clothingItems) {
          db.run(
            `INSERT INTO clothing_items (id, order_id, clothing_type, quantity, price, total, special_instructions)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [ci.id, ci.order_id, ci.clothing_type, ci.quantity, ci.price, ci.total, ci.special_instructions || '']
          );
        }
      }

      // 7. Payments
      if (Array.isArray(backupData.payments)) {
        db.run('DELETE FROM payments');
        for (const p of backupData.payments) {
          db.run(
            `INSERT INTO payments (id, order_id, customer_id, amount, method, date, note)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [p.id, p.order_id, p.customer_id, p.amount, p.method, p.date, p.note || '']
          );
        }
      }

      // 8. Prices
      if (Array.isArray(backupData.prices)) {
        db.run('DELETE FROM prices');
        for (const pr of backupData.prices) {
          db.run(
            `INSERT INTO prices (id, name_en, name_ur, default_price, category)
             VALUES (?, ?, ?, ?, ?)`,
            [pr.id, pr.name_en, pr.name_ur, pr.default_price, pr.category || 'men']
          );
        }
      }

      // 9. Custom Measurement Definitions
      if (Array.isArray(backupData.customMeasurementDefinitions)) {
        db.run('DELETE FROM custom_measurement_definitions');
        for (const cmd of backupData.customMeasurementDefinitions) {
          db.run(
            `INSERT INTO custom_measurement_definitions (id, name, name_ur, unit, image, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              cmd.id,
              cmd.name,
              cmd.name_ur || cmd.nameUr || '',
              cmd.unit || 'Inches',
              cmd.image || '',
              cmd.created_at || cmd.createdAt || new Date().toISOString(),
              cmd.updated_at || cmd.updatedAt || ''
            ]
          );
        }
      }

      saveDatabaseToDisk();
      res.json({ success: true, message: 'Data restored successfully.' });
    } catch (err: any) {
      console.error('Error restoring backup:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Vite Middlewares for development vs Static serving for production ---
  const isProduction = process.env.NODE_ENV === 'production' || process.env.ELECTRON_PRODUCTION === 'true';

  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          ws: { server },
        },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('[Server] Vite dev middleware loaded with HMR WebSocket attached to HTTP server.');
    } catch (viteErr) {
      console.warn('[Server] Could not initialize Vite dev middleware:', viteErr);
    }
  } else {
    // In production serve dist directory
    const possibleDistDirs = [
      path.resolve(__dirname, 'dist'),
      path.resolve(__dirname, '..', 'dist'),
      path.resolve(process.cwd(), 'dist'),
    ];
    let distPath = '';
    for (const d of possibleDistDirs) {
      if (fs.existsSync(d) && fs.existsSync(path.join(d, 'index.html'))) {
        distPath = d;
        break;
      }
    }

    if (distPath) {
      console.log(`[Server] Serving production static files from: ${distPath}`);
      app.use(express.static(distPath));
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
          return next();
        }
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  const HOST = process.env.HOST || '0.0.0.0';
  return new Promise((resolve) => {
    server.listen(PORT, HOST, () => {
      console.log(`[Awais Tailor House] App server running on ${HOST}:${PORT}`);
      resolve(server);
    });
  });
}

// Start server when run directly or imported
let serverPromise: Promise<any> | null = null;
export function startBackend() {
  if (!serverPromise) {
    serverPromise = startServer().catch((err) => {
      console.error('Fatal error starting server:', err);
      process.exit(1);
    });
  }
  return serverPromise;
}

startBackend();
export { startServer };
