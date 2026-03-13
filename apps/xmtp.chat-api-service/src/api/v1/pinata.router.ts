import { Router, type Request, type Response } from "express";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY,
});

export async function getPresignedUrl(req: Request, res: Response) {
  try {
    console.log('[Pinata] PINATA_JWT:', process.env.PINATA_JWT ? 'set' : 'empty');
    console.log('[Pinata] PINATA_GATEWAY:', process.env.PINATA_GATEWAY);
    console.log('[Pinata] PINATA_GROUP_ID:', process.env.PINATA_GROUP_ID);

    const url = await pinata.upload.public.createSignedURL({
      expires: 60, // Last for 60 seconds
      groupId: process.env.PINATA_GROUP_ID,
    });

    res.json({ url });
  } catch (error) {
    console.error('[Pinata] Error:', error);
    throw new Error("Failed to generate presigned URL");
  }
}

const pinataRouter = Router();

pinataRouter.get("/presigned-url", getPresignedUrl);

export default pinataRouter;
