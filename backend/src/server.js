const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/database');
const typeDefs = require('./graphql/schemas');
const resolvers = require('./graphql/resolvers');
const authController = require('./controllers/authController');
const businessController = require('./controllers/businessController');
const mongoose = require('mongoose');
const Batch = require('./models/batch');
const blockchainService = require('./services/blockchainService');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        await connectDB();

        const server = new ApolloServer({
            typeDefs,
            resolvers,
            csrfPrevention: false,
            introspection: true,
            formatError: (error) => {
                console.error('GraphQL Error:', error);
                return error;
            },
        });

        await server.start();

        const app = express();

        app.use(cors());
        app.use(express.json());

        app.get('/health', (_, res) => {
            res.status(200).json({ ok: true });
        });

        // Public verification endpoint (no auth): used by QR scan page
        app.get('/api/batch/:id', async (req, res) => {
            try {
                const { id } = req.params;

                if (!mongoose.Types.ObjectId.isValid(id)) {
                    return res.status(400).json({ error: 'Invalid batch id' });
                }

                const batch = await Batch.findById(id)
                    .populate({
                        path: 'farm',
                        populate: {
                            path: 'farmer',
                            select: 'name'
                        }
                    })
                    .lean();

                if (!batch) {
                    return res.status(404).json({ error: 'Batch not found' });
                }

                const verification = await blockchainService.checkOrganicStatus(id);
                const activities = Array.isArray(batch.activities) ? batch.activities : [];
                const harvests = Array.isArray(batch.harvests) ? batch.harvests : [];

                const activityTimeline = activities.map((activity) => ({
                    type: activity.activityType,
                    date: activity.date,
                    title: activity.activityType,
                    notes: activity.notes || activity.productName || '',
                    quantity: activity.quantity,
                    blockchainStatus: activity.blockchainStatus || 'pending',
                    blockchainTxHash: activity.blockchainTxHash || null,
                    blockchainBlock: activity.blockchainBlock || null,
                    isOrganic: activity.isOrganic || false
                }));

                const harvestTimeline = harvests.map((harvest) => ({
                    type: 'HARVEST',
                    date: harvest.harvestDate,
                    title: 'HARVEST',
                    notes: harvest.qualityGrade ? `Grade ${harvest.qualityGrade}` : '',
                    quantity: harvest.totalQty,
                    blockchainStatus: 'n/a',
                    blockchainTxHash: null,
                    blockchainBlock: null,
                    isOrganic: false
                }));

                const timeline = [...activityTimeline, ...harvestTimeline].sort(
                    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                );

                const latestTx = [...activities]
                    .reverse()
                    .find((activity) => activity.blockchainTxHash);

                const farm = batch.farm || {};
                const farmName = farm.farmer?.name
                    ? `${farm.farmer.name}'s Farm`
                    : `Farm ${String(farm._id || '').slice(-6)}`;

                return res.json({
                    id: String(batch._id),
                    cropName: batch.cropName,
                    cropCategory: batch.cropCategory,
                    variety: batch.variety,
                    sowingDate: batch.sowingDate,
                    currentState: batch.currentState,
                    farm: {
                        id: farm._id ? String(farm._id) : null,
                        name: farmName,
                        location: {
                            latitude: farm.location?.latitude ?? null,
                            longitude: farm.location?.longitude ?? null,
                            pinCode: farm.pinCode || null
                        },
                        organicStatus: farm.organicStatus || null,
                        soilType: farm.soilType || null,
                        size: farm.size || null
                    },
                    timeline,
                    blockchain: {
                        verified: !!verification?.verified,
                        isOrganic: !!verification?.isOrganic,
                        activityCount: verification?.activityCount || '0',
                        contractAddress: process.env.ACTIVITY_LOG_ADDRESS || null,
                        latestTxHash: latestTx?.blockchainTxHash || null,
                        latestTxEtherscanUrl: latestTx?.blockchainTxHash
                            ? `https://sepolia.etherscan.io/tx/${latestTx.blockchainTxHash}`
                            : null,
                        contractEtherscanUrl: process.env.ACTIVITY_LOG_ADDRESS
                            ? `https://sepolia.etherscan.io/address/${process.env.ACTIVITY_LOG_ADDRESS}`
                            : null
                    }
                });
            } catch (error) {
                console.error('Public batch verify API error:', error.message);
                return res.status(500).json({ error: 'Failed to fetch batch verification data' });
            }
        });

        app.use(
            '/',
            expressMiddleware(server, {
                context: async ({ req }) => {
                    const token = req?.headers?.authorization;

                    if (!token) {
                        return { user: null, business: null };
                    }

                    let user = null;
                    let business = null;

                    try {
                        user = await authController.getUserFromToken(token);
                    } catch (error) {
                        console.error('Auth context user error:', error.message);
                    }

                    try {
                        business = await businessController.getBusinessFromToken(token);
                    } catch (error) {
                        console.error('Auth context business error:', error.message);
                    }

                    return { user, business };
                },
            })
        );

        app.listen(PORT, () => {
            console.log(`Server ready at http://localhost:${PORT}/`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

module.exports = { startServer };

