const { getData } = require('../../models/data/indicataModel');

async function getRow(req, res) {
  try {
    let paramData = req.body.params;
    const data = await getData(paramData);
    res.json({ data: data });
  } catch (err) {
    console.error('Veri hatası', err);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
}

module.exports = { getRow };
