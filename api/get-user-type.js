export default async (req, res) => {
  const { hubspotutk } = req.query;
  if (!hubspotutk) return res.status(400).json({ error: 'Missing hubspotutk' });

  const hubspotUrl =
    `https://api.hubapi.com/contacts/v1/contact/utk/${hubspotutk}/profile` +
    `?hapikey=${process.env.HUBSPOT_API_KEY}&property=user_type`;

  try {
    const data = await fetch(hubspotUrl).then(r => r.json());
    const userType = data?.properties?.user_type?.value || 'default';
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json({ userType });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'HubSpot fetch failed' });
  }
};