# GitHub Pages + Google Sheet 公用便條貼白板｜需求規格與開發書

版本：v1.0  
用途：交由 Codex / 開發者實作  
目標平台：GitHub Pages 靜態網站  
資料儲存：公開權限 Google Sheet / Google Form 回應表  
身份機制：匿名，不記錄學生身份

---

## 1. 專案目標

本專案要開發一個「公用便條貼白板」靜態網頁工具。老師開啟 GitHub Pages 網站後，貼上 Google Sheet / Google Form 相關網址，系統產生一個可分享的白板連結與 QR Code。學生掃描 QR Code 後進入同一個白板，可以新增、編輯、拖曳、調整便條貼大小。便條貼的內容、座標、尺寸、顏色與刪除狀態儲存在 Google Sheet 中。

本系統不建置後端伺服器、不使用資料庫、不使用登入系統，僅使用 GitHub Pages 作為前端，並利用 Google Sheet 作為資料儲存來源。

---

## 2. 核心限制與設計原則

### 2.1 技術限制

由於 GitHub Pages 是純靜態網站，前端無法安全保存 Google API 憑證；若直接使用 Google Sheets API 寫入資料，會遇到授權與安全性問題。因此本系統採用下列其中一種寫入策略：

1. **建議策略：Google Form 寫入 + Google Sheet 讀取**
   - Google Form 負責接收學生送出的便條貼資料。
   - Google Sheet 作為 Google Form 的回應表。
   - 前端定期讀取公開 Google Sheet，整理成白板狀態。

2. **替代策略：公開可編輯 Google Sheet**
   - 若老師將 Google Sheet 設為「知道連結的人都可以編輯」，理論上可嘗試直接寫入。
   - 不建議作為第一版，因為權限、穩定性與安全性較差。

### 2.2 設計原則

- 不記錄學生身份。
- 不要求學生登入 Google 帳號。
- 所有操作以匿名方式寫入。
- 不直接修改既有資料列，而是採用「事件紀錄 event log」模式。
- 每次新增、移動、縮放、編輯、刪除便條貼，都新增一筆操作紀錄。
- 前端根據每張便條貼最新的一筆紀錄，還原目前白板狀態。
- 以課堂活動、腦力激盪、匿名回饋、KJ 法為主要使用情境。
- 不追求毫秒級即時協作，採用定期輪詢同步。

---

## 3. 使用情境

### 3.1 老師端流程

1. 老師建立一份 Google Form。
2. Google Form 回應資料連結到 Google Sheet。
3. 老師將 Google Sheet 設定為「知道連結的人可以檢視」。
4. 老師開啟本系統 GitHub Pages 網站。
5. 老師貼上必要設定資料，例如：
   - Google Sheet ID 或公開 CSV / GViz URL。
   - Google Form submit URL。
   - Google Form 各欄位的 entry ID。
6. 系統產生白板連結。
7. 系統產生 QR Code。
8. 老師投影白板畫面。
9. 學生掃描 QR Code 後進入同一個白板。
10. 老師畫面定期同步學生新增或修改的便條貼。

### 3.2 學生端流程

1. 學生掃描 QR Code。
2. 進入白板頁面。
3. 按下「新增便條貼」。
4. 輸入內容。
5. 拖曳便條貼位置。
6. 調整便條貼大小。
7. 修改顏色或內容。
8. 每次操作會寫入 Google Form。
9. 不需要登入、不輸入姓名。

---

## 4. 系統範圍

### 4.1 第一版 MVP 必做功能

- 老師設定頁。
- 學生白板頁。
- QR Code 產生。
- 便條貼新增。
- 便條貼文字編輯。
- 便條貼拖曳。
- 便條貼縮放。
- 便條貼刪除。
- 便條貼顏色選擇。
- Google Form 寫入。
- Google Sheet 讀取。
- 定期同步白板狀態。
- 匿名使用，不記錄學生身份。
- 白板資料以 URL query string 保存設定。

### 4.2 第一版不做功能

- 使用者登入。
- 權限控管。
- 學生姓名記錄。
- 老師審核機制。
- WebSocket 即時同步。
- 後端伺服器。
- Apps Script。
- Google OAuth。
- 版本回復。
- 同一張便條貼多人鎖定。
- 防止惡意操作。

---

## 5. 技術架構

### 5.1 前端

建議技術：

- HTML5
- CSS3
- JavaScript ES Modules
- Vite，或單純原生 HTML/CSS/JS
- QRCode.js 或 qrcode npm package
- interact.js 或自製 pointer event 拖曳縮放

若希望部署最簡單，建議使用：

```text
純 HTML + CSS + JavaScript
```

若希望開發維護較佳，建議使用：

```text
Vite + TypeScript
```

### 5.2 部署

- 使用 GitHub Pages。
- 所有檔案皆為靜態檔案。
- 不需要 Node.js server。
- 不需要資料庫。

### 5.3 資料層

- 寫入：Google Form submit endpoint。
- 讀取：Google Sheet 公開 CSV 或 Google Visualization API。

建議讀取方式：

```text
https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:json&sheet={SHEET_NAME}
```

或使用 CSV：

```text
https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}
```

---

## 6. Google Form 欄位設計

請老師建立 Google Form，欄位如下：

| 欄位名稱 | 型態 | 說明 |
|---|---|---|
| board_id | 簡答 | 白板 ID |
| note_id | 簡答 | 便條貼 ID |
| action | 簡答 | create / update / delete |
| text | 段落 | 便條貼文字內容 |
| x | 簡答 | X 座標 |
| y | 簡答 | Y 座標 |
| width | 簡答 | 寬度 |
| height | 簡答 | 高度 |
| color | 簡答 | 顏色 |
| z_index | 簡答 | 圖層順序 |
| timestamp_client | 簡答 | 前端產生的時間戳記 |

Google Form 送出後，會在 Google Sheet 中自動新增一列資料。

---

## 7. Google Sheet 欄位設計

Google Form 回應表應包含下列欄位。Google Form 會自動加入第一欄 `Timestamp`。

| 欄位 | 說明 | 範例 |
|---|---|---|
| Timestamp | Google Form 自動時間 | 2026/07/08 下午9:00:00 |
| board_id | 白板 ID | board_abc123 |
| note_id | 便條貼 ID | note_x7f9k2 |
| action | 操作類型 | create |
| text | 文字內容 | 我覺得這個方法很好 |
| x | X 座標 | 120 |
| y | Y 座標 | 240 |
| width | 寬度 | 180 |
| height | 高度 | 120 |
| color | 顏色 | yellow |
| z_index | 圖層 | 10 |
| timestamp_client | 前端時間 | 2026-07-08T13:00:00.000Z |

---

## 8. Event Log 還原規則

Google Sheet 只保存操作紀錄，不保存最終狀態。前端讀取所有資料列後，依照下列規則還原白板狀態。

### 8.1 過濾白板

只處理 `board_id` 等於目前 URL 中 `board_id` 的資料列。

### 8.2 依 note_id 分組

同一個 `note_id` 可能有多筆紀錄，例如：

```text
create -> update -> update -> delete
```

### 8.3 取最新紀錄

每個 `note_id` 取時間最新的一筆作為目前狀態。時間排序優先順序：

1. `timestamp_client`
2. Google Form 自動產生的 `Timestamp`
3. 讀取順序，後面列視為較新

### 8.4 刪除狀態

若最新紀錄的 `action` 為 `delete`，該便條貼不顯示。

### 8.5 顯示狀態

若最新紀錄的 `action` 為 `create` 或 `update`，顯示該便條貼。

---

## 9. URL 設計

### 9.1 老師設定頁

```text
/index.html
```

功能：

- 輸入 Google Sheet ID。
- 輸入 Sheet 名稱或 gid。
- 輸入 Google Form submit URL。
- 輸入各欄位 entry ID。
- 產生 board_id。
- 產生學生連結。
- 產生 QR Code。

### 9.2 白板頁

```text
/board.html?board_id=board_abc123&sheet_id=xxxx&gid=0&form_url=xxxx&field_board_id=entry.xxxx&field_note_id=entry.xxxx&...
```

### 9.3 URL 參數

| 參數 | 必填 | 說明 |
|---|---|---|
| board_id | 是 | 白板 ID |
| sheet_id | 是 | Google Sheet ID |
| sheet_name | 否 | Sheet 名稱 |
| gid | 否 | Sheet gid |
| form_url | 是 | Google Form submit URL |
| field_board_id | 是 | board_id 對應的 entry ID |
| field_note_id | 是 | note_id 對應的 entry ID |
| field_action | 是 | action 對應的 entry ID |
| field_text | 是 | text 對應的 entry ID |
| field_x | 是 | x 對應的 entry ID |
| field_y | 是 | y 對應的 entry ID |
| field_width | 是 | width 對應的 entry ID |
| field_height | 是 | height 對應的 entry ID |
| field_color | 是 | color 對應的 entry ID |
| field_z_index | 是 | z_index 對應的 entry ID |
| field_timestamp_client | 是 | timestamp_client 對應的 entry ID |

---

## 10. 前端畫面規格

### 10.1 老師設定頁

頁面區塊：

1. 標題區
   - 系統名稱：公用便條貼白板
   - 簡短說明：貼上 Google Sheet / Form 設定後，產生學生 QR Code。

2. 設定輸入區
   - Google Sheet ID
   - Sheet name 或 gid
   - Google Form submit URL
   - 各欄位 entry ID

3. 快速教學區
   - 說明老師如何建立 Google Form。
   - 說明如何取得 entry ID。
   - 說明如何公開 Google Sheet 讀取權限。

4. 產生按鈕
   - 「產生白板連結」

5. 結果區
   - 學生連結
   - 複製連結按鈕
   - QR Code
   - 開啟老師白板按鈕

### 10.2 白板頁

頁面區塊：

1. 上方工具列
   - 新增便條貼
   - 同步狀態
   - 手動重新整理
   - 便條貼數量

2. 白板區
   - 可顯示多張便條貼
   - 支援拖曳
   - 支援縮放
   - 支援點擊編輯
   - 支援刪除

3. 便條貼
   - 顯示文字
   - 顯示顏色
   - 右下角縮放把手
   - 刪除按鈕
   - 編輯按鈕或雙擊編輯

---

## 11. 便條貼操作規格

### 11.1 新增便條貼

流程：

1. 使用者按「新增便條貼」。
2. 前端產生 note_id。
3. 預設位置為目前畫面中央附近。
4. 預設尺寸：180 x 120。
5. 預設顏色：yellow。
6. 顯示文字輸入框。
7. 儲存後送出 create 事件至 Google Form。

### 11.2 編輯文字

流程：

1. 使用者雙擊便條貼或按編輯按鈕。
2. 文字區變成 textarea。
3. 使用者完成輸入後，按 Enter + Ctrl 或點擊外部儲存。
4. 送出 update 事件。

### 11.3 拖曳

流程：

1. 使用者按住便條貼拖曳。
2. 拖曳中即時更新畫面。
3. 放開滑鼠或手指後，送出 update 事件。
4. 避免拖曳過程中每一個 pixel 都寫入。

### 11.4 縮放

流程：

1. 使用者拖曳右下角縮放把手。
2. 限制最小尺寸：120 x 80。
3. 限制最大尺寸：600 x 400。
4. 放開後送出 update 事件。

### 11.5 刪除

流程：

1. 使用者按刪除按鈕。
2. 前端可跳出確認。
3. 送出 delete 事件。
4. 本機立即隱藏該便條貼。

---

## 12. 同步策略

### 12.1 輪詢頻率

預設每 3～5 秒讀取 Google Sheet 一次。

建議設定：

```text
SYNC_INTERVAL_MS = 5000
```

### 12.2 手動重新整理

工具列提供「重新同步」按鈕，使用者可手動抓取最新資料。

### 12.3 本機樂觀更新

使用者新增、編輯、拖曳、刪除後，前端立即更新本機畫面，不等待 Google Sheet 讀取完成。

### 12.4 衝突處理

若多人修改同一張便條貼，以最新 timestamp 為準。第一版不做鎖定與衝突提示。

---

## 13. Google Form 寫入實作

Google Form submit endpoint 通常格式如下：

```text
https://docs.google.com/forms/d/e/{FORM_ID}/formResponse
```

前端送出方式可使用 `fetch` 搭配 `FormData`，但 Google Form 可能有 CORS 限制。建議第一版採用隱藏 iframe 或 no-cors fetch。

### 13.1 no-cors fetch 範例

```javascript
async function submitEvent(config, event) {
  const formData = new FormData();
  formData.append(config.fields.board_id, event.board_id);
  formData.append(config.fields.note_id, event.note_id);
  formData.append(config.fields.action, event.action);
  formData.append(config.fields.text, event.text || '');
  formData.append(config.fields.x, String(event.x));
  formData.append(config.fields.y, String(event.y));
  formData.append(config.fields.width, String(event.width));
  formData.append(config.fields.height, String(event.height));
  formData.append(config.fields.color, event.color || 'yellow');
  formData.append(config.fields.z_index, String(event.z_index || 1));
  formData.append(config.fields.timestamp_client, new Date().toISOString());

  await fetch(config.formUrl, {
    method: 'POST',
    mode: 'no-cors',
    body: formData,
  });
}
```

注意：`no-cors` 模式下無法確認送出是否成功。因此 UI 只能顯示「已嘗試送出」，後續以同步讀取結果確認。

---

## 14. Google Sheet 讀取實作

### 14.1 使用 GViz JSON

```javascript
async function fetchSheetRows(sheetId, sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  const text = await res.text();

  const jsonText = text.substring(
    text.indexOf('{'),
    text.lastIndexOf('}') + 1
  );

  const data = JSON.parse(jsonText);
  return parseGvizRows(data);
}
```

### 14.2 使用 CSV

```javascript
async function fetchCsvRows(sheetId, gid) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  const res = await fetch(url);
  const csv = await res.text();
  return parseCsv(csv);
}
```

第一版建議優先使用 GViz，因為可以指定 sheet 名稱。

---

## 15. 資料結構

### 15.1 Config

```typescript
type BoardConfig = {
  boardId: string;
  sheetId: string;
  sheetName?: string;
  gid?: string;
  formUrl: string;
  fields: {
    board_id: string;
    note_id: string;
    action: string;
    text: string;
    x: string;
    y: string;
    width: string;
    height: string;
    color: string;
    z_index: string;
    timestamp_client: string;
  };
};
```

### 15.2 NoteEvent

```typescript
type NoteAction = 'create' | 'update' | 'delete';

type NoteEvent = {
  board_id: string;
  note_id: string;
  action: NoteAction;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  z_index: number;
  timestamp_client: string;
  timestamp_server?: string;
};
```

### 15.3 NoteState

```typescript
type NoteState = {
  note_id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  z_index: number;
  updated_at: string;
  deleted: boolean;
};
```

---

## 16. 建議檔案結構

若使用 Vite + TypeScript：

```text
sticky-board/
├── index.html
├── board.html
├── package.json
├── vite.config.ts
├── src/
│   ├── main.ts
│   ├── board.ts
│   ├── config.ts
│   ├── googleForm.ts
│   ├── googleSheet.ts
│   ├── noteStore.ts
│   ├── qr.ts
│   ├── types.ts
│   └── styles.css
└── README.md
```

若使用純 HTML/CSS/JS：

```text
sticky-board/
├── index.html
├── board.html
├── css/
│   └── styles.css
├── js/
│   ├── index.js
│   ├── board.js
│   ├── google-form.js
│   ├── google-sheet.js
│   ├── note-store.js
│   └── qr.js
└── README.md
```

---

## 17. UI/UX 建議

### 17.1 視覺風格

- 類似白板或便利貼牆。
- 背景使用淡灰或淺色格線。
- 便條貼使用柔和色彩。
- 文字大小適合投影觀看。

### 17.2 便條貼顏色

提供以下顏色：

```text
yellow, pink, blue, green, purple, orange
```

### 17.3 行動裝置支援

學生多半使用手機，因此要支援：

- 觸控拖曳。
- 觸控縮放把手。
- 手機螢幕新增便條貼。
- 文字輸入時不影響畫面。

---

## 18. 錯誤處理

### 18.1 設定錯誤

若缺少必要 URL 參數，顯示：

```text
白板設定不完整，請回到老師設定頁重新產生連結。
```

### 18.2 Google Sheet 無法讀取

顯示：

```text
無法讀取 Google Sheet，請確認試算表已設定為知道連結的人可以檢視。
```

### 18.3 Google Form 無法確認送出

因 `no-cors` 限制，前端可能無法知道是否成功。UI 顯示：

```text
已送出，資料同步可能需要幾秒鐘。
```

---

## 19. 安全性與風險說明

第一版為低門檻課堂工具，不適合保存敏感資料。

需在 README 與老師設定頁提醒：

- 請勿要求學生填寫姓名、學號、電話、Email 或個資。
- 公開 Google Sheet 代表知道連結的人可能讀取資料。
- Google Form 若被外流，可能被惡意送出資料。
- 本系統不提供身份驗證與權限控管。
- 適合短時間課堂活動，不適合作為正式資料收集系統。

---

## 20. 開發任務切分

### Task 1：建立專案骨架

- 建立 GitHub Pages 可部署的前端專案。
- 建立 `index.html` 與 `board.html`。
- 建立基本 CSS。
- 確認可本機啟動與 build。

### Task 2：老師設定頁

- 建立表單欄位。
- 可輸入 Sheet ID、sheet name/gid、Form URL、entry IDs。
- 自動產生 board_id。
- 將設定編碼進學生白板 URL。
- 產生 QR Code。
- 提供複製連結功能。

### Task 3：Google Sheet 讀取模組

- 實作 GViz 讀取。
- 解析欄位。
- 轉換成 NoteEvent 陣列。
- 加入錯誤處理。

### Task 4：Event Log 還原模組

- 根據 board_id 過濾資料。
- 根據 note_id 分組。
- 取最新狀態。
- 排除 delete 狀態。
- 回傳 NoteState 陣列。

### Task 5：Google Form 寫入模組

- 實作 `submitEvent(config, event)`。
- 支援 create/update/delete。
- 使用 no-cors fetch 或 hidden iframe。
- 加入基本錯誤處理。

### Task 6：白板 UI

- 顯示便條貼。
- 新增便條貼。
- 編輯文字。
- 刪除便條貼。
- 顏色選擇。

### Task 7：拖曳與縮放

- 支援滑鼠拖曳。
- 支援觸控拖曳。
- 支援右下角縮放。
- 放開後才寫入 update 事件。

### Task 8：同步機制

- 每 5 秒讀取 Google Sheet。
- 手動重新整理。
- 顯示同步狀態。
- 避免正在編輯時被遠端狀態覆蓋。

### Task 9：README 與部署說明

- 說明如何建立 Google Form。
- 說明如何取得 entry ID。
- 說明如何公開 Google Sheet。
- 說明如何部署到 GitHub Pages。
- 說明限制與風險。

---

## 21. 驗收標準

### 21.1 老師端

- 可以輸入 Google Sheet / Google Form 設定。
- 可以產生白板連結。
- 可以產生 QR Code。
- 複製連結後可在其他裝置開啟。

### 21.2 學生端

- 學生可透過連結進入白板。
- 可以新增便條貼。
- 可以輸入文字。
- 可以移動便條貼。
- 可以調整大小。
- 可以刪除便條貼。
- 不需要登入。

### 21.3 資料同步

- 新增便條貼後，Google Sheet 有新增資料列。
- 老師端白板可在數秒內看到學生新增的便條貼。
- 移動或修改便條貼後，其他裝置可看到更新後狀態。
- 刪除便條貼後，其他裝置不再顯示該便條貼。

### 21.4 資料模型

- 同一張便條貼多次更新後，只顯示最新狀態。
- `action=delete` 的便條貼不顯示。
- 不同 `board_id` 的資料不互相混在一起。

---

## 22. Codex 開發提示詞

可將以下提示詞交給 Codex：

```text
請根據本規格書，開發一個可部署在 GitHub Pages 的公用便條貼白板。

需求重點：
1. 只能使用前端靜態網頁，不建立後端。
2. 使用 Google Form 寫入資料，使用公開 Google Sheet 讀取資料。
3. 採用 event log 模式，每次 create/update/delete 都新增一筆資料。
4. 前端讀取 Sheet 後，依 board_id 過濾，依 note_id 分組，取最新一筆還原白板狀態。
5. 學生不登入、不記名。
6. 老師設定頁需能輸入 Google Sheet、Google Form 與 entry IDs，產生學生連結與 QR Code。
7. 白板頁需支援新增、編輯、拖曳、縮放、刪除便條貼。
8. 每 5 秒同步一次資料。
9. 請產生完整可執行專案，包含 README、部署說明與範例設定。
```

---

## 23. 後續可擴充功能

未來可加入：

- 老師鎖定白板。
- 老師清空白板。
- 密碼保護。
- 便條貼分類。
- 投票功能。
- 匯出 PNG。
- 匯出 CSV。
- 多頁白板。
- 背景圖片。
- 老師模式與學生模式分離。
- 使用 Supabase / Firebase 等後端服務提高同步穩定性。

---

## 24. 第一版建議結論

第一版請採用：

```text
GitHub Pages 靜態前端
+ Google Form 匿名寫入
+ Google Sheet 公開讀取
+ Event Log 狀態還原
+ QR Code 分享
```

這是最符合「低門檻、免後端、不登入、老師容易操作」的實作方式。
