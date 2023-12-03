var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
var prepare = () => {
  Document = mongoose.model("Document", DocumentSchema, "Document");
};

// database/schemas/preview.schema.ts
import mongoose2, { Schema as Schema2 } from "mongoose";
var PreviewSchema = new Schema2({
  id: String,
  photo: Boolean,
  waveform: Boolean
});
var Preview;
var prepare2 = () => {
  Preview = mongoose2.model("Preview", PreviewSchema, "Preview");
};

// folders.ts
var folders = {
  FILES: "",
  PREVIEWS: "",
  TEMP: "",
  PDF_PAGES: "",
  PARTITIONS: ""
};
var setupFoldersPath = (rootPath) => {
  folders.FILES = `${rootPath}/data/files`;
  folders.PREVIEWS = `${rootPath}/data/previews`;
  folders.TEMP = `${rootPath}/data/temp`;
  folders.PDF_PAGES = `${rootPath}/data/pdf-pages`;
  folders.PARTITIONS = `${rootPath}/data/partitions`;
};
var folders_default = folders;

// config.ts
var config = {
  LIARA_ENDPOINT: "",
  LIARA_BUCKET_NAME: "",
  LIARA_ACCESS_KEY: "",
  LIARA_SECRET_KEY: "",
  MONGODB_URI: "",
  TEMP_STORAGE: ""
};
var setupConfig = (c) => {
  for (let key in config) {
    config[key] = c[key];
  }
  setupFoldersPath(config.TEMP_STORAGE);
};
var config_default = config;

// database/transactions/upload.ts
import fs2 from "fs";
import mongoose5 from "mongoose";

// database/drivers/main-driver.ts
import mongoose3 from "mongoose";
import { S3Client } from "@aws-sdk/client-s3";
var connectMongoClient = () => __async(void 0, null, function* () {
  return new Promise((resolve) => {
    mongoose3.connect(
      config_default.MONGODB_URI,
      (err) => {
        if (err) {
          console.error("FAILED TO CONNECT TO MONGODB");
          console.error(err);
        } else {
          console.log("CONNECTED TO MONGODB");
          resolve({});
        }
      }
    );
  });
});
var s3Client;
var connectToS3 = () => __async(void 0, null, function* () {
  s3Client = new S3Client({
    region: "default",
    endpoint: config_default.LIARA_ENDPOINT,
    credentials: {
      accessKeyId: config_default.LIARA_ACCESS_KEY,
      secretAccessKey: config_default.LIARA_SECRET_KEY
    }
  });
});

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
import { exec } from "child_process";
import fs from "fs";
import { fromPath } from "pdf2pic";
import genThumbnail from "simple-thumbnail";
import sharp from "sharp";
import { getAudioDurationInSeconds } from "get-audio-duration";
import sizeOf from "image-size";
var generatePreview = (documentPath, documentId, previewId, type, extension) => {
  return new Promise((resolve) => {
    if (type === "application" && extension === "pdf") {
      let tempFilePath = folders_default.TEMP + "/" + documentId + ".pdf";
      fs.copyFileSync(documentPath, tempFilePath);
      const options = {
        density: 100,
        saveFilename: documentId,
        savePath: folders_default.PDF_PAGES,
        format: "jpg",
        width: 300,
        height: 400
      };
      fromPath(tempFilePath, options).bulk(1, true).then((output) => {
        fs.rmSync(tempFilePath);
        if (output.length > 0) {
          fs.writeFileSync(
            folders_default.PREVIEWS + "/" + previewId + ".jpg",
            output[0].base64,
            "base64"
          );
        }
        resolve({ previewPath: folders_default.PREVIEWS + "/" + previewId + ".jpg" });
      });
    } else if (type === "video") {
      genThumbnail(
        documentPath,
        folders_default.PREVIEWS + "/" + previewId + ".jpg",
        "256x196"
      ).then(() => {
        resolve({
          previewPath: folders_default.PREVIEWS + "/" + previewId + ".jpg"
        });
      }).catch((err) => console.error(err));
    } else if (type === "image") {
      const finalPreviewPath = folders_default.PREVIEWS + "/" + previewId + ".jpg";
      sharp(documentPath).resize(200, 200).toFile(finalPreviewPath, function(err) {
        sizeOf(finalPreviewPath, function(err2, dimensions) {
          resolve({
            width: dimensions.width,
            height: dimensions.height,
            previewPath: finalPreviewPath
          });
        });
      });
    } else if (type === "audio") {
      const tempFilePath = folders_default.TEMP + "/" + documentId + "." + extension;
      const tempMp3FilePath = folders_default.TEMP + "/" + documentId + ".mp3";
      fs.copyFileSync(documentPath, tempFilePath);
      let calculatingGraph = () => {
        exec(
          `ffmpeg -i ${extension === "mp3" ? tempMp3FilePath : tempFilePath} -f wav - | audiowaveform --input-format wav --output-format json --pixels-per-second 2 -b 8 > ${folders_default.PREVIEWS + "/" + previewId + ".json"}`,
          (error, stdout, stderr) => __async(void 0, null, function* () {
            console.log(stdout);
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
              console.log(ex);
            }
            console.log("generating cover...");
            let cover;
            try {
              let { parseFile, selectCover } = yield import("music-metadata");
              const { common } = yield parseFile(extension === "mp3" ? tempMp3FilePath : tempFilePath);
              cover = selectCover(common.picture);
            } catch (ex) {
              console.log(ex);
            }
            if (cover) {
              fs.writeFile(folders_default.PREVIEWS + "/" + previewId + ".jpg", cover.data, { flag: "w" }, () => {
                sharp(folders_default.PREVIEWS + "/" + previewId + ".jpg").resize(200, 200).toFile(folders_default.PREVIEWS + "/" + previewId, function(err) {
                  console.log("generated cover.");
                  fs.rmSync(folders_default.PREVIEWS + "/" + previewId + ".jpg");
                  fs.renameSync(
                    folders_default.PREVIEWS + "/" + previewId,
                    folders_default.PREVIEWS + "/" + previewId + ".jpg"
                  );
                  if (fs.existsSync(tempFilePath))
                    fs.rmSync(tempFilePath);
                  if (fs.existsSync(tempMp3FilePath))
                    fs.rmSync(tempMp3FilePath);
                  resolve({
                    duration,
                    previewPath: folders_default.PREVIEWS + "/" + previewId + ".jpg",
                    waveformPath: fs.existsSync(folders_default.PREVIEWS + "/" + previewId + ".json") ? folders_default.PREVIEWS + "/" + previewId + ".json" : void 0
                  });
                });
              });
            } else {
              console.log("cover generation failed.");
              if (fs.existsSync(tempFilePath))
                fs.rmSync(tempFilePath);
              if (fs.existsSync(tempMp3FilePath))
                fs.rmSync(tempMp3FilePath);
              resolve({
                duration,
                previewPath: "",
                waveformPath: fs.existsSync(folders_default.PREVIEWS + "/" + previewId + ".json") ? folders_default.PREVIEWS + "/" + previewId + ".json" : void 0
              });
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
      resolve({ previewPath: "" });
    }
  });
};

// database/transactions/upload.ts
import { PutObjectCommand } from "@aws-sdk/client-s3";

// database/schemas/group.schema.ts
import mongoose4, { Schema as Schema3 } from "mongoose";
var GroupSchema = new Schema3({
  roomId: String,
  docIds: [String]
});
var Group;
var prepare3 = () => {
  Group = mongoose4.model("Group", GroupSchema, "Group");
};

// database/transactions/upload.ts
function getFilesizeInBytes(filename) {
  var stats = fs2.statSync(filename);
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}
var finalup = (path, roomId, humanId, isPublic, extension, type, title) => __async(void 0, null, function* () {
  const session = yield mongoose5.startSession();
  session.startTransaction();
  let preview2 = (yield Preview.create([{
    id: generator_exports.makeUniqueId()
  }], { session }))[0];
  let fileSize = getFilesizeInBytes(path);
  let document2 = (yield Document.create([{
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
      extension,
      title
    }
  }], { session }))[0];
  let group = yield Group.findOne({ roomId }).session(session).lean().exec();
  if (group === null) {
    group = (yield Group.create([{
      roomId,
      docIds: [document2.id]
    }], { session }))[0];
  } else {
    yield Group.updateOne({ roomId }, { $push: { docIds: document2.id } }).session(session);
  }
  yield session.commitTransaction();
  session.endSession();
  try {
    let res = yield previewer_exports.generatePreview(path, document2.id, preview2.id, type, extension);
    let { duration, width, height, previewPath, waveformPath } = res;
    const docParams = {
      Bucket: config_default.LIARA_BUCKET_NAME,
      Key: document2.id,
      Body: fs2.createReadStream(path)
    };
    yield s3Client.send(new PutObjectCommand(docParams));
    let hasPhoto = false, hasWaveform = false;
    if ((previewPath == null ? void 0 : previewPath.length) > 0) {
      hasPhoto = true;
      const prevParams = {
        Bucket: config_default.LIARA_BUCKET_NAME,
        Key: preview2.id,
        Body: fs2.createReadStream(previewPath)
      };
      yield s3Client.send(new PutObjectCommand(prevParams));
      yield fs2.promises.rm(previewPath);
    }
    if ((waveformPath == null ? void 0 : waveformPath.length) > 0) {
      hasWaveform = true;
      const prevParams = {
        Bucket: config_default.LIARA_BUCKET_NAME,
        Key: preview2.id + "-waveform",
        Body: fs2.createReadStream(waveformPath)
      };
      yield s3Client.send(new PutObjectCommand(prevParams));
      yield fs2.promises.rm(waveformPath);
    }
    const session2 = yield mongoose5.startSession();
    session2.startTransaction();
    preview2 = yield Preview.findOneAndUpdate({ id: preview2.id }, { photo: hasPhoto, waveform: hasWaveform }, { new: true }).session(session2);
    if (duration || width && height) {
      if (duration) {
        document2 = yield Document.findOneAndUpdate({ id: document2.id }, { duration }, { new: true }).session(session2);
      } else if (width && height) {
        document2 = yield Document.findOneAndUpdate({ id: document2.id }, { width, height }, { new: true }).session(session2);
      }
    }
    yield session2.commitTransaction();
    session2.endSession();
    return { success: true, document: document2, preview: preview2 };
  } catch (error) {
    console.log(error);
  }
});

// database/transactions/download.ts
var download_exports = {};
__export(download_exports, {
  document: () => document,
  preview: () => preview,
  waveform: () => waveform
});
import { GetObjectCommand } from "@aws-sdk/client-s3";
var document = (documentId, roomId, range, res, onEnd) => __async(void 0, null, function* () {
  try {
    let success = false;
    let doc = yield Document.findOne({ id: documentId }).exec();
    if (doc !== null) {
      if (doc.isPublic || doc.secret.roomIds.includes(roomId)) {
        const params = {
          Bucket: config_default.LIARA_BUCKET_NAME,
          Key: documentId,
          Range: range
        };
        try {
          const data = yield s3Client.send(new GetObjectCommand(params));
          data.Body.transformToWebStream().pipeTo(res).then(() => onEnd && onEnd());
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
        success = true;
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
var waveform = (documentId, roomId, res) => __async(void 0, null, function* () {
  try {
    let success = false;
    let doc = yield Document.findOne({ id: documentId }).exec();
    if (doc !== null) {
      if (doc.isPublic || doc.secret.roomIds.includes(roomId)) {
        if (doc.type === "audio") {
          const params = {
            Bucket: config_default.LIARA_BUCKET_NAME,
            Key: doc.previewId + "-waveform"
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

// database/transactions/group.ts
var group_exports = {};
__export(group_exports, {
  docById: () => docById,
  docIds: () => docIds,
  docsByIds: () => docsByIds,
  removeDoc: () => removeDoc,
  updateDoc: () => updateDoc
});
var docIds = (roomId) => __async(void 0, null, function* () {
  let group = yield Group.findOne({ roomId }).lean().exec();
  if (group !== null) {
    return { success: true, docIds: group.docIds };
  } else {
    return { success: false };
  }
});
var docsByIds = (docIds2) => __async(void 0, null, function* () {
  let docs = yield Document.find({ id: { $in: docIds2 } }).lean().exec();
  let previewsDict = {};
  (yield Preview.find({ id: { $in: docs.map((d) => d.previewId) } })).forEach((p) => previewsDict[p.id] = []);
  let result = [];
  docs.forEach((d) => {
    result.push(__spreadProps(__spreadValues({}, d), { preview: previewsDict[d.previewId] }));
  });
  return { success: true, docs: result };
});
var docById = (docId) => __async(void 0, null, function* () {
  let doc = yield Document.findOne({ id: docId }).lean().exec();
  if (doc !== null) {
    return { success: true, doc: __spreadProps(__spreadValues({}, doc), { preview: yield Preview.findOne({ id: doc.previewId }) }) };
  } else {
    return { success: false };
  }
});
var removeDoc = (docId) => __async(void 0, null, function* () {
  let doc = yield Document.findOneAndDelete({ id: docId });
  return { success: doc !== null };
});
var updateDoc = (docId, data) => __async(void 0, null, function* () {
  let doc = yield Document.findOneAndUpdate({ id: docId }, { $set: { "metadata.title": data.title } }, { new: true }).lean();
  return doc ? { success: true, doc } : { success: false };
});

// database/schemas/index.ts
var build = () => {
  prepare();
  prepare2();
  prepare3();
};

// database/initiators/main-initiator.ts
import fs3 from "fs";
var setupDatabase = () => __async(void 0, null, function* () {
  yield connectMongoClient();
  yield connectToS3();
  build();
  if (!fs3.existsSync(`${config_default.TEMP_STORAGE}/data`))
    yield fs3.promises.mkdir(`${config_default.TEMP_STORAGE}/data`, { recursive: true });
  if (!fs3.existsSync(`${config_default.TEMP_STORAGE}/data/files`))
    yield fs3.promises.mkdir(`${config_default.TEMP_STORAGE}/data/files`, { recursive: true });
  if (!fs3.existsSync(`${config_default.TEMP_STORAGE}/data/previews`))
    yield fs3.promises.mkdir(`${config_default.TEMP_STORAGE}/data/previews`, { recursive: true });
  if (!fs3.existsSync(`${config_default.TEMP_STORAGE}/data/temp`))
    yield fs3.promises.mkdir(`${config_default.TEMP_STORAGE}/data/temp`, { recursive: true });
  if (!fs3.existsSync(`${config_default.TEMP_STORAGE}/data/pdf-pages`))
    yield fs3.promises.mkdir(`${config_default.TEMP_STORAGE}/data/pdf-pages`, { recursive: true });
  if (!fs3.existsSync(`${config_default.TEMP_STORAGE}/data/partitions`))
    yield fs3.promises.mkdir(`${config_default.TEMP_STORAGE}/data/partitions`, { recursive: true });
});

// database/index.ts
var StorageDriver = class _StorageDriver {
  static initialize() {
    return __async(this, null, function* () {
      return new Promise((resolve) => {
        return new _StorageDriver(resolve);
      });
    });
  }
  static instance() {
    return _StorageDriver.inst;
  }
  constructor(callback) {
    _StorageDriver.inst = this;
    setupDatabase().then(() => {
      callback();
    });
  }
};
var database_default = StorageDriver;

// app.ts
var SigmaStorage = class {
  constructor(config2) {
    this.uploader = upload_exports;
    this.downloader = download_exports;
    this.group = group_exports;
    setupConfig(config2);
  }
  start() {
    return __async(this, null, function* () {
      yield database_default.initialize();
    });
  }
};
var app_default = SigmaStorage;

// index.ts
var storage_default = app_default;
export {
  storage_default as default
};
//# sourceMappingURL=index.mjs.map