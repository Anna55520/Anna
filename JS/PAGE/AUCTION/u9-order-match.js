
// ============================================================
// U9 ORDER MATCH
// 获取 u9_round_settings
// ============================================================

const U9_ORDER_MATCH_URL =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/u9-order-match";


// ============================================================
// 获取 U9 Round Settings
// ============================================================

async function getU9RoundSettings() {
  try {
    const response = await fetch(U9_ORDER_MATCH_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data?.message ||
        data?.error ||
        `u9-order-match request failed: ${response.status}`
      );
    }

    console.log(
      "[U9] Round Settings Loaded:",
      data.settings
    );

    return data.settings;

  } catch (error) {

    console.error(
      "[U9] Failed to load round settings:",
      error
    );

    throw error;
  }
}


// ============================================================
// 加载并保存到 window
// ============================================================

async function loadU9RoundSettings() {

  const settings = await getU9RoundSettings();

  // 给其他前端 JS 使用
  window.U9RoundSettings = settings;

  console.log(
    "[U9] Settings available:",
    window.U9RoundSettings
  );

  return settings;
}


// ============================================================
// 页面加载后自动获取
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

  try {

    await loadU9RoundSettings();

  } catch (error) {

    console.error(
      "[U9] Round settings initialization failed:",
      error
    );

  }

});
