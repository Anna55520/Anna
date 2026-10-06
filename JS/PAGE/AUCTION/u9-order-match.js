
const U9_ORDER_MATCH_URL =
  "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/u9-order-match";

/**
 * 获取 U9 Round Settings
 *
 * 返回：
 * {
 *   success: true,
 *   settings: {
 *     default_target_orders: 3,
 *     matching_min_seconds: 5,
 *     matching_max_seconds: 10,
 *     cooldown_seconds: 10,
 *     minimum_start_coins: 50,
 *     enabled: true
 *   }
 * }
 */
export async function getU9RoundSettings() {
  try {
    const response = await fetch(U9_ORDER_MATCH_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data?.message ||
        data?.error ||
        `u9-order-match request failed: ${response.status}`
      );
    }

    return data.settings;
  } catch (error) {
    console.error("[u9-order-match] Failed to get settings:", error);
    throw error;
  }
}

/**
 * 加载 U9 Settings
 *
 * 页面需要使用时调用：
 *
 * const settings = await loadU9RoundSettings();
 */
export async function loadU9RoundSettings() {
  const settings = await getU9RoundSettings();

  console.log("[u9-order-match] Round Settings:", settings);

  return settings;
}
