import { sessionRepository } from "../../modules/auth/session.repository";
import { logger } from "./loggers";


export const detectLoginAnomaly = async (userId: string, newIpAddress: string, newDeviceId: string): Promise<void> => {
    // Get existing sessions for the user
    const existingSessions = await sessionRepository.findAllByUserId(userId);
    if (existingSessions.length === 0) return; // No previous sessions, so no anomaly

    // check for ip address if it new.
    const knownIPs = existingSessions
    .map(s => s.ip_address)
    .filter(Boolean);

    const isNewIp = !knownIPs.includes(newIpAddress);

    // check for device id if it new.
    const knownDevices = existingSessions
    .map(s => s.device_id)
    .filter(Boolean);

    const isNewDevice = !knownDevices.includes(newDeviceId);

    if (isNewIp) {
        // Log the anomaly
        logger.warn(`Login anomaly detected for user ${userId}: new IP address ${newIpAddress}`);

        // Optionally, send an alert to the user or admin
        // await notificationService.sendLoginAnomalyAlert(userId, newIpAddress);
    }

    if (isNewDevice) {
        // Log the anomaly
        logger.warn(`Login anomaly detected for user ${userId}: new device ID ${newDeviceId}`);

        // Optionally, send an alert to the user or admin
        // await notificationService.sendLoginAnomalyAlert(userId, newDeviceId);
    }
}