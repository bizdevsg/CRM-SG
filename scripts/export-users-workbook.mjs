import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: "server/.env" });

function xmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function columnLetter(index) {
  let value = index + 1;
  let result = "";

  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }

  return result;
}

function cellRef(rowIndex, columnIndex) {
  return `${columnLetter(columnIndex)}${rowIndex + 1}`;
}

function inlineStringCell(ref, value, styleId = 0) {
  return `<c r="${ref}" t="inlineStr" s="${styleId}"><is><t xml:space="preserve">${xmlEscape(
    value,
  )}</t></is></c>`;
}

function numberCell(ref, value, styleId = 0) {
  return `<c r="${ref}" s="${styleId}"><v>${value}</v></c>`;
}

function buildColumnsXml(widths) {
  return `<cols>${widths
    .map(
      (width, index) =>
        `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`,
    )
    .join("")}</cols>`;
}

function buildSheetXml({
  rows,
  columnWidths,
  merges = [],
  autoFilter = null,
  freezeTopRow = false,
}) {
  const rowXml = rows
    .map((cells, rowIndex) => {
      const cellsXml = cells
        .map((cell, columnIndex) => {
          const ref = cellRef(rowIndex, columnIndex);

          if (cell.type === "number") {
            return numberCell(ref, cell.value, cell.styleId ?? 0);
          }

          return inlineStringCell(ref, cell.value, cell.styleId ?? 0);
        })
        .join("");

      return `<row r="${rowIndex + 1}">${cellsXml}</row>`;
    })
    .join("");

  const dimension = `A1:${cellRef(
    Math.max(rows.length - 1, 0),
    Math.max(columnWidths.length - 1, 0),
  )}`;
  const mergeXml = merges.length
    ? `<mergeCells count="${merges.length}">${merges
        .map((range) => `<mergeCell ref="${range}"/>`)
        .join("")}</mergeCells>`
    : "";
  const autoFilterXml = autoFilter ? `<autoFilter ref="${autoFilter}"/>` : "";
  const sheetViewXml = freezeTopRow
    ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>`
    : `<sheetViews><sheetView workbookViewId="0"/></sheetViews>`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="${dimension}"/>
  ${sheetViewXml}
  <sheetFormatPr defaultRowHeight="18"/>
  ${buildColumnsXml(columnWidths)}
  <sheetData>${rowXml}</sheetData>
  ${autoFilterXml}
  ${mergeXml}
</worksheet>`;
}

function buildStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="5">
    <font>
      <sz val="11"/>
      <color rgb="FF1F2937"/>
      <name val="Calibri"/>
      <family val="2"/>
    </font>
    <font>
      <b/>
      <sz val="18"/>
      <color rgb="FFFFFFFF"/>
      <name val="Calibri"/>
      <family val="2"/>
    </font>
    <font>
      <b/>
      <sz val="11"/>
      <color rgb="FF111827"/>
      <name val="Calibri"/>
      <family val="2"/>
    </font>
    <font>
      <b/>
      <sz val="16"/>
      <color rgb="FF92400E"/>
      <name val="Calibri"/>
      <family val="2"/>
    </font>
    <font>
      <b/>
      <sz val="11"/>
      <color rgb="FFFFFFFF"/>
      <name val="Calibri"/>
      <family val="2"/>
    </font>
  </fonts>
  <fills count="6">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFB45309"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFDE68A"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1D4ED8"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border>
      <left/><right/><top/><bottom/><diagonal/>
    </border>
    <border>
      <left style="thin"><color rgb="FFE5E7EB"/></left>
      <right style="thin"><color rgb="FFE5E7EB"/></right>
      <top style="thin"><color rgb="FFE5E7EB"/></top>
      <bottom style="thin"><color rgb="FFE5E7EB"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="8">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="3" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="4" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center" wrapText="1"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="5" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="top" wrapText="1"/>
    </xf>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>`;
}

function buildSummaryRows(data) {
  return [
    [
      { value: "Database User Export", styleId: 1 },
      { value: "", styleId: 1 },
      { value: "", styleId: 1 },
      { value: "", styleId: 1 },
    ],
    [
      {
        value: `Generated on ${data.generatedAt}`,
        styleId: 6,
      },
      { value: "", styleId: 6 },
      { value: "", styleId: 6 },
      { value: "", styleId: 6 },
    ],
    [],
    [
      { value: "Total Users", styleId: 2 },
      { value: data.totalUsers, styleId: 3, type: "number" },
      { value: "Active Users", styleId: 2 },
      { value: data.activeUsers, styleId: 3, type: "number" },
    ],
    [
      { value: "Superadmin", styleId: 2 },
      { value: data.roleCounts.superadmin || 0, styleId: 3, type: "number" },
      { value: "Admin", styleId: 2 },
      { value: data.roleCounts.admin || 0, styleId: 3, type: "number" },
    ],
    [
      { value: "Marketing", styleId: 2 },
      { value: data.roleCounts.marketing || 0, styleId: 3, type: "number" },
      { value: "Companies Covered", styleId: 2 },
      { value: data.companyCount, styleId: 3, type: "number" },
    ],
    [],
    [
      { value: "Role", styleId: 4 },
      { value: "Count", styleId: 4 },
      { value: "Status", styleId: 4 },
      { value: "Count", styleId: 4 },
    ],
    [
      { value: "Superadmin", styleId: 5 },
      { value: data.roleCounts.superadmin || 0, styleId: 7, type: "number" },
      { value: "Active", styleId: 5 },
      { value: data.activeUsers, styleId: 7, type: "number" },
    ],
    [
      { value: "Admin", styleId: 5 },
      { value: data.roleCounts.admin || 0, styleId: 7, type: "number" },
      { value: "Inactive", styleId: 5 },
      { value: data.inactiveUsers, styleId: 7, type: "number" },
    ],
    [
      { value: "Marketing", styleId: 5 },
      { value: data.roleCounts.marketing || 0, styleId: 7, type: "number" },
      { value: "Latest User ID", styleId: 5 },
      { value: data.latestUserId, styleId: 7, type: "number" },
    ],
  ];
}

function buildUserRows(users) {
  const header = [
    "ID",
    "Name",
    "Username",
    "Email",
    "Role",
    "Status",
    "Company",
    "Branch",
    "E-Card Position",
    "Real Position",
    "Phone",
    "License Number",
    "NIK",
    "Created At",
    "Profile Description",
  ].map((value) => ({ value, styleId: 4 }));

  const rows = users.map((user) => [
    { value: Number(user.id), type: "number", styleId: 7 },
    { value: user.name || "", styleId: 5 },
    { value: user.username || "", styleId: 5 },
    { value: user.email || "", styleId: 5 },
    { value: user.role || "", styleId: 5 },
    { value: user.status || "", styleId: 5 },
    { value: user.company_name || "", styleId: 5 },
    { value: user.branch_name || "", styleId: 5 },
    { value: user.ecard_position || "", styleId: 5 },
    { value: user.real_position || "", styleId: 5 },
    { value: user.phone_number || "", styleId: 5 },
    { value: user.license_number || "", styleId: 5 },
    { value: user.nik || "", styleId: 5 },
    { value: user.created_at || "", styleId: 5 },
    { value: user.profile_description || "", styleId: 5 },
  ]);

  return [header, ...rows];
}

function buildWorkbookXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <fileVersion appName="xl"/>
  <workbookPr defaultThemeVersion="166925"/>
  <bookViews>
    <workbookView xWindow="240" yWindow="15" windowWidth="16095" windowHeight="9660"/>
  </bookViews>
  <sheets>
    <sheet name="Summary" sheetId="1" r:id="rId1"/>
    <sheet name="Users" sheetId="2" r:id="rId2"/>
  </sheets>
</workbook>`;
}

function buildContentTypesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;
}

function buildRootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
}

function buildWorkbookRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

function buildCoreXml(timestampIso) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>User Database Export</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${timestampIso}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${timestampIso}</dcterms:modified>
</cp:coreProperties>`;
}

function buildAppXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Excel</Application>
  <HeadingPairs>
    <vt:vector size="2" baseType="variant">
      <vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant>
      <vt:variant><vt:i4>2</vt:i4></vt:variant>
    </vt:vector>
  </HeadingPairs>
  <TitlesOfParts>
    <vt:vector size="2" baseType="lpstr">
      <vt:lpstr>Summary</vt:lpstr>
      <vt:lpstr>Users</vt:lpstr>
    </vt:vector>
  </TitlesOfParts>
</Properties>`;
}

async function writeFile(targetPath, content) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, content, "utf8");
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "ecard_platform_db",
  });

  const [users] = await connection.query(`
    SELECT
      u.id,
      u.name,
      u.username,
      u.email,
      u.role,
      CASE WHEN u.is_active = 1 THEN 'Active' ELSE 'Inactive' END AS status,
      u.is_active,
      u.nik,
      u.license_number,
      COALESCE(up.display_position, u.real_position) AS ecard_position,
      u.real_position,
      c.name AS company_name,
      b.name AS branch_name,
      up.phone_number,
      up.description AS profile_description,
      DATE_FORMAT(u.created_at, '%Y-%m-%d %H:%i:%s') AS created_at
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    LEFT JOIN branches b ON b.id = u.branch_id
    LEFT JOIN user_profiles up ON up.user_id = u.id
    ORDER BY FIELD(u.role, 'superadmin', 'admin', 'marketing'), u.name
  `);

  await connection.end();

  const roleCounts = users.reduce((accumulator, user) => {
    const role = user.role || "unknown";
    accumulator[role] = (accumulator[role] || 0) + 1;
    return accumulator;
  }, {});

  const companies = new Set(
    users.map((user) => user.company_name).filter(Boolean),
  );
  const totalUsers = users.length;
  const activeUsers = users.filter((user) => Number(user.is_active) === 1).length;
  const inactiveUsers = totalUsers - activeUsers;
  const latestUserId = users.reduce(
    (maximum, user) => Math.max(maximum, Number(user.id) || 0),
    0,
  );
  const now = new Date();
  const timestampIso = now.toISOString();
  const generatedAt = `${timestampIso.slice(0, 10)} ${timestampIso.slice(11, 19)} UTC`;

  const summaryRows = buildSummaryRows({
    generatedAt,
    totalUsers,
    activeUsers,
    inactiveUsers,
    roleCounts,
    companyCount: companies.size,
    latestUserId,
  });
  const userRows = buildUserRows(users);

  const workbookDir = path.join(
    os.tmpdir(),
    `ecard-user-export-${Date.now()}`,
  );
  const outputDir = path.resolve("outputs");
  const outputPath = path.join(outputDir, "daftar-user-database.xlsx");
  const zipPath = path.join(outputDir, "daftar-user-database.zip");

  await fs.rm(workbookDir, { recursive: true, force: true });
  await fs.rm(zipPath, { force: true });
  await fs.rm(outputPath, { force: true });

  await writeFile(
    path.join(workbookDir, "[Content_Types].xml"),
    buildContentTypesXml(),
  );
  await writeFile(path.join(workbookDir, "_rels", ".rels"), buildRootRelsXml());
  await writeFile(path.join(workbookDir, "docProps", "core.xml"), buildCoreXml(timestampIso));
  await writeFile(path.join(workbookDir, "docProps", "app.xml"), buildAppXml());
  await writeFile(path.join(workbookDir, "xl", "workbook.xml"), buildWorkbookXml());
  await writeFile(
    path.join(workbookDir, "xl", "_rels", "workbook.xml.rels"),
    buildWorkbookRelsXml(),
  );
  await writeFile(path.join(workbookDir, "xl", "styles.xml"), buildStylesXml());
  await writeFile(
    path.join(workbookDir, "xl", "worksheets", "sheet1.xml"),
    buildSheetXml({
      rows: summaryRows,
      columnWidths: [24, 14, 24, 14],
      merges: ["A1:D1", "A2:D2"],
    }),
  );
  await writeFile(
    path.join(workbookDir, "xl", "worksheets", "sheet2.xml"),
    buildSheetXml({
      rows: userRows,
      columnWidths: [8, 28, 20, 28, 14, 12, 28, 30, 26, 24, 18, 22, 20, 21, 64],
      autoFilter: `A1:${cellRef(userRows.length - 1, userRows[0].length - 1)}`,
      freezeTopRow: true,
    }),
  );

  await fs.mkdir(outputDir, { recursive: true });

  execFileSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-Command",
      `Compress-Archive -Path '${workbookDir}\\*' -DestinationPath '${zipPath}' -Force`,
    ],
    { stdio: "inherit" },
  );

  await fs.rename(zipPath, outputPath);

  console.log(
    JSON.stringify(
      {
        outputPath,
        totalUsers,
        activeUsers,
        latestUserId,
      },
      null,
      2,
    ),
  );
}

await main();
