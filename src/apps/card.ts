import express from 'express';

const createApp = (route: string, handler: Function) => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.post(route, async (req, res) => {
        try {
            handler(req);
        }
        catch (e) {
            console.log(e);
        }

        res.status(200);
        res.json('OK');
    });
}

export default createApp;