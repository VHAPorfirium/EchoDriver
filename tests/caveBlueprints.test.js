import { test } from "node:test";
import assert from "node:assert/strict";
import { caveBlueprints } from "../src/domain/caveBlueprints.js";
import { CaveLayout } from "../src/domain/CaveLayout.js";
import { CavePathFinder } from "../src/domain/CavePathFinder.js";

const tileSizeInPixels = 32;

caveBlueprints.forEach((caveBlueprint) => {
  test(`${caveBlueprint.caveName}: every row has the same width`, () => {
    const rowWidths = new Set(caveBlueprint.rows.map((row) => row.length));
    assert.equal(rowWidths.size, 1, `widths found: ${[...rowWidths].join(", ")}`);
  });

  test(`${caveBlueprint.caveName}: the border is solid rock`, () => {
    const { rows } = caveBlueprint;
    const lastRowIndex = rows.length - 1;
    const lastColumnIndex = rows[0].length - 1;
    rows.forEach((row, rowIndex) => {
      const isTopOrBottomRow = rowIndex === 0 || rowIndex === lastRowIndex;
      if (isTopOrBottomRow) {
        assert.match(row, /^#+$/, `row ${rowIndex}`);
      }
      assert.equal(row[0], "#", `row ${rowIndex} left`);
      assert.equal(row[lastColumnIndex], "#", `row ${rowIndex} right`);
    });
  });

  test(`${caveBlueprint.caveName}: has one start and one exit, and the exit is reachable`, () => {
    const allSymbols = caveBlueprint.rows.join("");
    assert.equal(allSymbols.split("P").length - 1, 1);
    assert.equal(allSymbols.split("X").length - 1, 1);

    const caveLayout = new CaveLayout(caveBlueprint, tileSizeInPixels);
    const pathToExit = new CavePathFinder(caveLayout).findPathOfTileCenters(caveLayout.diverStartPosition, caveLayout.exitPosition);
    assert.ok(pathToExit.length > 0);
  });

  test(`${caveBlueprint.caveName}: every pearl and oxygen bubble is reachable`, () => {
    const caveLayout = new CaveLayout(caveBlueprint, tileSizeInPixels);
    const cavePathFinder = new CavePathFinder(caveLayout);
    [...caveLayout.pearlPositions, ...caveLayout.oxygenBubblePositions].forEach((collectiblePosition) => {
      assert.ok(cavePathFinder.findPathOfTileCenters(caveLayout.diverStartPosition, collectiblePosition).length > 0);
    });
  });
});
