var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// database/transactions/upload.ts
var upload_exports = {};
__export(upload_exports, {
  finalup: () => finalup
});

// database/schemas/document.schema.ts
import mongoose, { Schema } from "mongoose";
var DocumentSchema = new Schema({
  id: String,
  type: String,
  time: Number,
  isPublic: Boolean,
  previewId: String,
  secret: Schema.Types.Mixed,
  metadata: Schema.Types.Mixed
});
var Document;

// database/schemas/preview.schema.ts
import mongoose2, { Schema as Schema2 } from "mongoose";
var PreviewSchema = new Schema2({
  id: String
});
var Preview;

// config.ts
var config_default = {
  LIARA_ENDPOINT: "storage.iran.liara.space",
  LIARA_BUCKET_NAME: "monopole",
  LIARA_ACCESS_KEY: "l2lt4s4m21mi6bf8",
  LIARA_SECRET_KEY: "5c967b73-65b7-42e0-a66d-698bc416acda"
};

// database/transactions/upload.ts
import fs2 from "fs";
import mongoose4 from "mongoose";

// database/drivers/main-driver.ts
import mongoose3 from "mongoose";
import { S3Client } from "@aws-sdk/client-s3";
var s3Client;

// utils/generator.ts
var generator_exports = {};
__export(generator_exports, {
  makeUniqueId: () => makeUniqueId
});
import * as crypto from "crypto";
var makeUniqueId = () => {
  return crypto.randomBytes(16).toString("hex");
};

// utils/previewer.ts
var previewer_exports = {};
__export(previewer_exports, {
  generatePreview: () => generatePreview
});

// folders.ts
var folders_default = {
  "FILES": "data/files",
  "PREVIEWS": "data/previews",
  "TEMP": "data/temp",
  "PDF_PAGES": "data/pdf-pages"
};

// utils/previewer.ts
import { exec } from "child_process";
import fs from "fs";
import { fromPath } from "pdf2pic";
import genThumbnail from "simple-thumbnail";
import sharp from "sharp";
import { getAudioDurationInSeconds } from "get-audio-duration";
import sizeOf from "image-size";
var generatePreview = (documentId, previewId, type, extension) => {
  return new Promise((resolve) => {
    if (type === "application" && extension === "pdf") {
      let tempFilePath = process.cwd() + "/" + folders_default.TEMP + "/" + documentId + ".pdf";
      let rawFilePath = process.cwd() + "/" + folders_default.FILES + "/" + documentId;
      fs.copyFileSync(rawFilePath, tempFilePath);
      const options = {
        density: 100,
        saveFilename: documentId,
        savePath: process.cwd() + "/" + folders_default.PDF_PAGES,
        format: "png",
        width: 1080,
        height: 1920
      };
      fromPath(tempFilePath, options).bulk(-1, true).then((output) => {
        fs.rmSync(tempFilePath);
        fs.mkdirSync(process.cwd() + "/" + folders_default.PDF_PAGES + "/" + previewId);
        for (let i = 0; i < output.length; i++) {
          fs.writeFileSync(
            process.cwd() + "/" + folders_default.PDF_PAGES + "/" + previewId + "/" + i + ".png",
            output[i].base64,
            "base64"
          );
        }
        resolve({});
      });
    } else if (type === "video") {
      genThumbnail(
        process.cwd() + "/" + folders_default.FILES + "/" + documentId,
        process.cwd() + "/" + folders_default.PREVIEWS + "/" + previewId + ".jpg",
        "256x196"
      ).then(() => {
        resolve({});
      }).catch((err) => console.error(err));
    } else if (type === "image") {
      const rawPreviewPath = process.cwd() + "/" + folders_default.PREVIEWS + "/" + previewId + ".jpg";
      sharp(process.cwd() + "/" + folders_default.FILES + "/" + documentId).resize(200, 200).toFile(rawPreviewPath, function(err) {
        const finalPreviewPath = process.cwd() + "/" + folders_default.PREVIEWS + "/" + previewId;
        fs.renameSync(rawPreviewPath, finalPreviewPath);
        sizeOf(finalPreviewPath, function(err2, dimensions) {
          resolve({ width: dimensions.width, height: dimensions.height });
        });
      });
    } else if (type === "audio") {
      const tempFilePath = process.cwd() + "/" + folders_default.TEMP + "/" + documentId + "." + extension;
      const tempMp3FilePath = process.cwd() + "/" + folders_default.TEMP + "/" + documentId + ".mp3";
      fs.copyFileSync(process.cwd() + "/" + folders_default.FILES + "/" + documentId, tempFilePath);
      let calculatingGraph = () => {
        exec(
          `ffmpeg -i ${extension === "mp3" ? tempMp3FilePath : tempFilePath} -f wav - | audiowaveform --input-format wav --output-format json --pixels-per-second 2 -b 8 > ${process.cwd() + "/" + folders_default.PREVIEWS + "/" + previewId + ".json"}`,
          (error, stdout, stderr) => __async(void 0, null, function* () {
            if (error) {
              console.log(`error: ${error}`);
            }
            if (stderr) {
              console.log(`stderr: ${stderr}`);
            }
            console.log("generated waveform.");
            console.log("measuring duration...");
            let duration = void 0;
            try {
              duration = yield getAudioDurationInSeconds(extension === "mp3" ? tempMp3FilePath : tempFilePath);
            } catch (ex) {
            }
            console.log("generating cover...");
            let cover2;
            try {
              const { parseFile, selectCover } = yield import("music-metadata");
              const { common } = yield parseFile(extension === "mp3" ? tempMp3FilePath : tempFilePath);
              cover2 = selectCover(common.picture);
            } catch (ex) {
            }
            if (cover2) {
              fs.writeFile(process.cwd() + "/" + folders_default.PREVIEWS + "/" + previewId + ".jpg", cover2.data, () => {
                sharp(process.cwd() + "/" + folders_default.PREVIEWS + "/" + previewId + ".jpg").resize(200, 200).toFile(process.cwd() + "/" + folders_default.PREVIEWS + "/" + previewId, function(err) {
                  console.log("generated cover.");
                  fs.rmSync(process.cwd() + "/" + folders_default.PREVIEWS + "/" + previewId + ".jpg");
                  fs.renameSync(
                    process.cwd() + "/" + folders_default.PREVIEWS + "/" + previewId,
                    process.cwd() + "/" + folders_default.PREVIEWS + "/" + previewId + ".jpg"
                  );
                  if (fs.existsSync(tempFilePath))
                    fs.rmSync(tempFilePath);
                  if (fs.existsSync(tempMp3FilePath))
                    fs.rmSync(tempMp3FilePath);
                  resolve({ duration });
                });
              });
            } else {
              console.log("cover generation failed.");
              if (fs.existsSync(tempFilePath))
                fs.rmSync(tempFilePath);
              if (fs.existsSync(tempMp3FilePath))
                fs.rmSync(tempMp3FilePath);
              resolve({ duration });
            }
          })
        );
      };
      if (extension === "aac" || extension === "ogg") {
        exec(
          `ffmpeg -i ${tempFilePath} -vn -ar 44100 -ac 2 -b:a 192k ${tempMp3FilePath}`,
          (error, stdout, stderr) => {
            extension = "mp3";
            console.log("generated mp3.");
            calculatingGraph();
          }
        );
      } else {
        calculatingGraph();
      }
    } else {
      resolve({});
    }
  });
};

// database/transactions/upload.ts
import { PutObjectCommand } from "@aws-sdk/client-s3";
function getFilesizeInBytes(filename) {
  var stats = fs2.statSync(filename);
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}
var finalup = (path, roomId, humanId, isPublic, extension, type) => __async(void 0, null, function* () {
  const session = yield mongoose4.startSession();
  session.startTransaction();
  let preview2 = yield Preview.create([{
    id: generator_exports.makeUniqueId()
  }], { session })[0];
  let fileSize = getFilesizeInBytes(path);
  let document2 = yield Document.create([{
    id: generator_exports.makeUniqueId(),
    isPublic,
    type,
    previewId: preview2.id,
    time: Date.now(),
    secret: {
      uploaderId: humanId,
      roomIds: [roomId]
    },
    metadata: {
      size: fileSize,
      duration: 0,
      width: 0,
      height: 0,
      extension
    }
  }], { session })[0];
  yield session.commitTransaction();
  session.endSession();
  const params = {
    Bucket: config_default.LIARA_BUCKET_NAME,
    Key: document2.id,
    Body: fs2.createReadStream(path)
  };
  try {
    yield s3Client.send(new PutObjectCommand(params));
    let { duration, width, height } = yield previewer_exports.generatePreview(document2.id, preview2.id, type, extension);
    yield fs2.promises.rm(path);
    if (duration || width && height) {
      const session2 = yield mongoose4.startSession();
      session2.startTransaction();
      if (duration) {
        document2 = yield Document.findOneAndUpdate({ id: document2.id }, { duration }, { new: true }).session(session2);
      } else if (width && height) {
        document2 = yield Document.updateOne({ id: document2.id }, { width, height }, { new: true }).session(session2);
      }
      yield session2.commitTransaction();
      session2.endSession();
    }
    return { success: true, document: document2, preview: preview2 };
  } catch (error) {
    console.log(error);
  }
});

// database/transactions/download.ts
var download_exports = {};
__export(download_exports, {
  cover: () => cover,
  document: () => document,
  preview: () => preview
});
import { GetObjectCommand } from "@aws-sdk/client-s3";
var document = (documentId, roomId, res) => __async(void 0, null, function* () {
  try {
    let success = false;
    let doc = yield Document.findOne({ id: documentId }).exec();
    if (doc !== null) {
      if (doc.isPublic || doc.secret.roomIds.includes(roomId)) {
        const params = {
          Bucket: config_default.LIARA_BUCKET_NAME,
          Key: documentId
        };
        try {
          const data = yield s3Client.send(new GetObjectCommand(params));
          data.Body.transformToWebStream().pipeTo(res);
        } catch (error) {
          console.log(error);
        }
        success = true;
      } else {
        console.error("access denied");
      }
    } else {
      console.error("document not found");
    }
    return { success };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
});
var preview = (documentId, roomId, res) => __async(void 0, null, function* () {
  try {
    let success = false;
    let doc = yield Document.findOne({ id: documentId }).exec();
    if (doc !== null) {
      if (doc.isPublic || doc.secret.roomIds.includes(roomId)) {
        const params = {
          Bucket: config_default.LIARA_BUCKET_NAME,
          Key: doc.previewId
        };
        try {
          const data = yield s3Client.send(new GetObjectCommand(params));
          data.Body.transformToWebStream().pipeTo(res);
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      console.error("document not found");
    }
    return { success };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
});
var cover = (documentId, roomId, res) => __async(void 0, null, function* () {
  try {
    let success = false;
    let doc = yield Document.findOne({ id: documentId }).exec();
    if (doc !== null) {
      if (doc.isPublic || doc.secret.roomIds.includes(roomId)) {
        if (doc.type === "audio") {
          const params = {
            Bucket: config_default.LIARA_BUCKET_NAME,
            Key: doc.previewId + "-cover"
          };
          try {
            const data = yield s3Client.send(new GetObjectCommand(params));
            data.Body.transformToWebStream().pipeTo(res);
          } catch (error) {
            console.log(error);
          }
        }
        success = true;
      } else {
        console.error("access denied");
      }
    } else {
      console.error("document not found");
    }
    return { success };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
});

// index.ts
var storage_default = {
  upload: upload_exports,
  download: download_exports
};
export {
  storage_default as default
};
//# sourceMappingURL=index.mjs.map