import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { ThirdwebStorage } from '@thirdweb-dev/storage';
import fs from 'fs';
import { Engine } from '@thirdweb-dev/engine';

export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method != 'POST') {
        res.status(405).send('Method not allowed');
        return;
    }

    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if(err) {
            res.status(500).send('Internal server error');
            return;
        }

        const image = files.image ? files.image[0] : null;
        const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
        const address = Array.isArray(fields.address) ? fields.address[0] : fields.address;

        if(!image || !name || !address) {
            res.status(400).send('Missing required fields');
            return;
        }

        const {
            TW_ENGINE_URL,
            TW_ACCESS_TOKEN,
            TW_BACKEND_WALLET,
            TW_CONTRACT_ADDRESS,
            TW_SECRET_KEY,
        } = process.env;
    
        if (!TW_ENGINE_URL || !TW_ACCESS_TOKEN || !TW_BACKEND_WALLET || !TW_CONTRACT_ADDRESS || !TW_SECRET_KEY) {
            res.status(500).send('Missing environment variables');
            return;
        }
    
        try {
            const storage = new ThirdwebStorage({
                secretKey: TW_SECRET_KEY,
            });
    
            const fileData = fs.readFileSync(image.filepath);

            const uri = await storage.upload(fileData);

            const metadata = {
                name: name,
                description: "NFT was created with NFT creator app.",
                image: uri,
            }

            const engine = new Engine({
                url: TW_ENGINE_URL,
                accessToken: TW_ACCESS_TOKEN,
            });

            const response = await engine.erc721.mintTo(
                "mumbai",
                TW_CONTRACT_ADDRESS,
                TW_BACKEND_WALLET,
                {
                    receiver: address,
                    metadata: metadata,
                }
            );

            res.status(200).json(response);

            fs.unlinkSync(image.filepath);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });
};