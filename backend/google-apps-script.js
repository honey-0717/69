/**
 * Google Apps Script for HotHarini69 Service Sheet Synchronization
 * 
 * Instructions:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1kTP12rOWkT5r0ty86hUB53VYs73Ys7V7DpOj1z0WMuE/edit
 * 2. Go to Extensions -> Apps Script
 * 3. Replace all code with this file's content
 * 4. Update WEBHOOK_URL with your backend URL (e.g. https://your-domain.com/api/google-sheets-sync/webhook)
 * 5. Click Save and Deploy -> New Deployment -> Web App (Execute as Me, Anyone has access)
 * 6. Copy the Web App URL and add GOOGLE_SHEET_WEBHOOK_URL to your backend .env file!
 */

const WEBHOOK_URL = 'http://localhost:5000/api/google-sheets-sync/webhook';

function onEdit(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const range = e.range;
    const row = range.getRow();

    if (row <= 1) return; // Skip header row

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowValues = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

    const service = {};
    headers.forEach((header, index) => {
      service[String(header).toLowerCase().trim()] = rowValues[index];
    });

    if (!service.id) return;

    const payload = {
      action: 'UPSERT',
      service: service,
      timestamp: new Date().toISOString()
    };

    UrlFetchApp.fetch(WEBHOOK_URL, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  } catch (err) {
    Logger.log('Error in onEdit sync: ' + err.toString());
  }
}

function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const action = contents.action;
    const service = contents.service;
    const id = contents.id || service?.id;

    if (sheet.getLastRow() === 0) {
      // Create headers
      sheet.appendRow([
        'id', 'name', 'category', 'short_description', 'description', 
        'price', 'duration', 'status', 'display_order', 'thumbnail_url', 
        'gallery_urls', 'updated_at'
      ]);
    }

    const data = sheet.getDataRange().getValues();
    let targetRowIndex = -1;

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        targetRowIndex = i + 1; // 1-indexed
        break;
      }
    }

    if (action === 'DELETE' && targetRowIndex > -1) {
      sheet.deleteRow(targetRowIndex);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', action: 'DELETED' }));
    }

    if (action === 'UPSERT' && service) {
      const rowData = [
        service.id,
        service.name,
        service.category,
        service.short_description,
        service.description,
        service.price,
        service.duration,
        service.status,
        service.display_order,
        service.thumbnail_url,
        service.gallery_urls,
        service.updated_at
      ];

      if (targetRowIndex > -1) {
        sheet.getRange(targetRowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', action: 'UPSERTED' }));
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'ignored' }));
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }));
  }
}
