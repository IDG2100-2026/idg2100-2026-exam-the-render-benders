import authService from "../services/auth.service.js";

async function register(req, res) {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message});
    }
}

async function login(req, res) {
    try {
        const result = await authService.login(req.body, req);
        if (!result) return res.status(400).json({ error: "Invalid username or password" });
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function refresh(req, res) {
    try {
        const result = await authService.refresh(req.body.refreshToken);
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
}
async function logout(req, res) {
    try {
        await authService.logout(req.body.refreshToken);
        res.status(204).send();
    } catch(err) {
        res.status(400).json({ error: err.message });
    }
}
async function verifyEmail(req, res) {
    try {
        const result = await authService.verifyEmail(req.body);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function resendVerification(req, res) {
    try {
        const result = await authService.resendVerification(req.body.email);
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}


export default {
    register,
    login,
    refresh,
    logout,
    verifyEmail,
    resendVerification
};