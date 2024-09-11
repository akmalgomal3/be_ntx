const db = require("../models");
const jwt = require('jsonwebtoken');

const WebSocket = require('ws');
const axios = require('axios');

const redis = require("redis");
const { promisify } = require("util");
const authConfig = require("../config/auth");

const redisClient = redis.createClient();
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

// const Model = db.Model;
// const { Op } = require("sequelize");..

exports.refactoreMe1 = async (req, res) => {
  try {
    const query = `
      SELECT AVG(values[1])  as avg1,
             AVG(values[2])  as avg2,
             AVG(values[3])  as avg3,
             AVG(values[4])  as avg4,
             AVG(values[5])  as avg5,
             AVG(values[6])  as avg6,
             AVG(values[7])  as avg7,
             AVG(values[8])  as avg8,
             AVG(values[9])  as avg9,
             AVG(values[10]) as avg10
      FROM surveys;
    `;

    const [result] = await db.sequelize.query(query);
    const totalIndex = Object.values(result[0]).map(avg => parseFloat(avg));

    res.status(200).send({
      statusCode: 200,
      success: true,
      data: totalIndex,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      statusCode: 500,
      success: false,
      message: "An error occurred while processing the survey data.",
    });
  }
};

exports.refactoreMe2 = async (req, res) => {
  const {userId, values, id} = req.body;

  try {
    const insertQuery = `
      INSERT INTO surveys ("userId", values, "createdAt", "updatedAt")
      VALUES ($1, $2, NOW(), NOW()) RETURNING *;
    `;

    const updateQuery = `
      UPDATE users
      SET dosurvey = true
      WHERE id = $1;
    `;

    await db.sequelize.transaction(async (t) => {
      const [surveyResult] = await db.sequelize.query(insertQuery, {
        bind: [userId, values],
        transaction: t,
      });

      await db.sequelize.query(updateQuery, {
        bind: [id],
        transaction: t,
      });

      res.status(201).send({
        statusCode: 201,
        message: "Survey sent successfully!",
        success: true,
        data: surveyResult[0],
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      statusCode: 500,
      message: "Cannot post survey.",
      success: false,
    });
  }
};

exports.callmeWebSocket = (server) => {
  // do something
  const wss = new WebSocket.Server({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection established');

    const fetchAndSendData = async () => {
      try {
        const response = await axios.get('https://livethreatmap.radware.com/api/map/attacks?limit=10');
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchAndSendData();
    const interval = setInterval(fetchAndSendData, 3 * 60 * 1000);

    ws.on('close', () => {
      console.log('Client disconnected');
      clearInterval(interval);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
};

const fetchAndSaveAttacks = async () => {
  try {
    const response = await axios.get('https://livethreatmap.radware.com/api/map/attacks?limit=10');
    const attacks = response.data.flat();

    const insertQuery = `
      INSERT INTO attacks ("sourceCountry", "destinationCountry", "timestamp")
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING;
    `;

    for (let attack of attacks) {
      await db.sequelize.query(insertQuery, {
        bind: [
          attack.sourceCountry,
          attack.destinationCountry,
          new Date(attack.attackTime)
        ],
      });
    }

    console.log("Data successfully inserted into the 'attacks' table.");
  } catch (error) {
    console.error('Error fetching or saving data:', error);
  }
};
fetchAndSaveAttacks();


exports.getData = async (req, res) => {
  // do something
  try {
    const cachedData = await getAsync('attack_data');
    if (cachedData) {
      return res.status(200).send({
        success: true,
        statusCode: 200,
        data: JSON.parse(cachedData),
        source: 'cache'
      });
    }
    const query = `
      SELECT 
        COALESCE(d."destinationCountry", s."sourceCountry") as country,
        COUNT(CASE WHEN d."destinationCountry" IS NOT NULL THEN 1 END) as attacked,
        COUNT(CASE WHEN s."sourceCountry" IS NOT NULL THEN 1 END) as attacker
      FROM 
        (SELECT DISTINCT "destinationCountry" FROM attacks) d
      FULL OUTER JOIN 
        (SELECT DISTINCT "sourceCountry" FROM attacks) s
      ON d."destinationCountry" = s."sourceCountry"
      GROUP BY COALESCE(d."destinationCountry", s."sourceCountry")
      ORDER BY attacked DESC, attacker DESC;
    `;

    const [results] = await db.sequelize.query(query);

    const data = {
      label: results.map(r => r.country),
      total: results.map(r => r.attacked + r.attacker)
    };

    await setAsync('attack_data', JSON.stringify(data), 'EX', 300);

    res.status(200).send({
      success: true,
      statusCode: 200,
      data: data,
      source: 'database'
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      statusCode: 500,
      message: "An error occurred while fetching attack data."
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { id, digits, company } = req.body;
    if (company === "NTX") {
      const token = jwt.sign({ id: id, digits: digits }, authConfig.secret, {
        expiresIn: 86400 // 24 jam
      });

      res.status(200).send({
        accessToken: token
      });
    } else {
      res.status(401).send({
        accessToken: null,
        message: "Invalid User!"
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};