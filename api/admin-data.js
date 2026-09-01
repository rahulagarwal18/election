export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.Supabase || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Database environment variables not configured on server' });
  }

  // Handle Status Update (POST)
  if (req.method === 'POST') {
    const { action, id, status } = req.body || {};
    if (action === 'update_status' && id && status) {
      try {
        const updateRes = await fetch(`${supabaseUrl}/rest/v1/ward5_grievances?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        });
        return res.status(200).json({ success: updateRes.ok });
      } catch (e) {
        return res.status(500).json({ error: e.message });
      }
    }
  }

  // Fetch Grievances and Supporters (GET)
  try {
    const [gRes, sRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/ward5_grievances?select=*&order=created_at.desc`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }),
      fetch(`${supabaseUrl}/rest/v1/ward5_supporters?select=*&order=created_at.desc`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      })
    ]);

    const grievances = gRes.ok ? await gRes.json() : [];
    const supporters = sRes.ok ? await sRes.json() : [];

    return res.status(200).json({ grievances, supporters });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
