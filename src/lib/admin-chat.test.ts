import { test } from "node:test";
import { strict as assert } from "node:assert";
import { canAdminManageChat } from "./admin-chat";

test("admins cannot manage personal chats", () => {
  assert.equal(canAdminManageChat({ recipient_id: "private-recipient" }), false);
});
test("admins can manage community chats", () => {
  assert.equal(canAdminManageChat({ recipient_id: null }), true);
});