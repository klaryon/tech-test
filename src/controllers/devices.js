const Device = require("../models/device");

const Logger = require("../utils/logger");

const {
  editDevice,
  registerDevice,
  sendPushNotification,
  sendSMS,
  viewDevice,
} = require("../utils/notifications");

const checkDevice = async (playerId, userId, platform, uniqueId) => {
      const deviceType = platform == "Android" ? 1 : 0;
      
      // Check if device exists, exclude just SMS
      let device = await Device.findOne({
        deviceId: playerId,
      });

      // If not exist create
      if (!device) {
        await new Promise((resolve, reject) => {
          if(playerId) resolve();
          reject({ statusCode: 400, message: 'Not playerId provided' });
        })
        .then(async () => {
          await viewDevice(playerId)
          .then((registeredDevice) =>
            Device.create({
              userId: registeredDevice.external_user_id || userId,
              deviceId: registeredDevice.id,
              identifier: registeredDevice.identifier,
              deviceType: registeredDevice.device_type,
              uniqueId
            })
            .then((doc) => (device = doc))
          )
        })
        .catch(async (error) => {
          Logger.warn({ message: error });

          if (error.statusCode == 400)
            await registerDevice({
              identifier: playerId,
              external_user_id: userId,
              device_type: deviceType 
            })
            .then((newDevice) =>
                Device.create({
                userId: newDevice.external_user_id || userId,
                deviceId: newDevice.id,
                identifier: playerId,
                deviceType,
                uniqueId
              })
              .then((doc) => (device = doc))
            )
            .catch((error) => {
              Logger.error({ message: error });
            })
        });

      } else {
        if(device.uniqueId != uniqueId) {
          device.uniqueId = uniqueId;
          device.save();
        }
        await editDevice(playerId, { external_user_id: userId }).catch((error) => {
          Logger.error({ message: error });
        });
      }
      return device;
};

module.exports = { checkDevice }; 