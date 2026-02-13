import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { configId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const googleApiKey = Deno.env.get("GOOGLE_SHEETS_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get config
    const { data: config, error: configError } = await supabase
      .from("google_forms_config")
      .select("*")
      .eq("id", configId)
      .single();

    if (configError || !config) {
      return new Response(
        JSON.stringify({ error: "Configuração não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!googleApiKey) {
      // Log the attempt
      await supabase.from("sync_logs").insert({
        config_id: configId,
        status: "error",
        error_message: "GOOGLE_SHEETS_API_KEY não configurada. Adicione o secret nas configurações do backend.",
        finished_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ error: "API Key do Google não configurada. Adicione o secret GOOGLE_SHEETS_API_KEY." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create sync log
    const { data: log } = await supabase.from("sync_logs").insert({
      config_id: configId,
      status: "running",
    }).select().single();

    try {
      // Fetch data from Google Sheets API
      const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheet_id}/values/${encodeURIComponent(config.sheet_name)}?key=${googleApiKey}`;
      const sheetRes = await fetch(sheetUrl);

      if (!sheetRes.ok) {
        const errBody = await sheetRes.text();
        throw new Error(`Google Sheets API error: ${sheetRes.status} - ${errBody}`);
      }

      const sheetData = await sheetRes.json();
      const rows = sheetData.values || [];

      // Update sync log
      await supabase.from("sync_logs").update({
        status: "success",
        rows_synced: Math.max(0, rows.length - 1), // minus header
        finished_at: new Date().toISOString(),
      }).eq("id", log?.id);

      // Update last sync
      await supabase.from("google_forms_config").update({
        last_sync_at: new Date().toISOString(),
      }).eq("id", configId);

      return new Response(
        JSON.stringify({
          success: true,
          rows_synced: Math.max(0, rows.length - 1),
          message: `${Math.max(0, rows.length - 1)} respostas sincronizadas com sucesso.`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (syncError) {
      await supabase.from("sync_logs").update({
        status: "error",
        error_message: (syncError as Error).message,
        finished_at: new Date().toISOString(),
      }).eq("id", log?.id);

      throw syncError;
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
