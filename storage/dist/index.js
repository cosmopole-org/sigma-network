var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
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

// index.ts
var storage_exports = {};
__export(storage_exports, {
  default: () => storage_default
});
module.exports = __toCommonJS(storage_exports);

// database/transactions/upload.ts
var upload_exports = {};
__export(upload_exports, {
  finalup: () => finalup
});

// database/schemas/document.schema.ts
var import_mongoose = __toESM(require("mongoose"));
var DocumentSchema = new import_mongoose.Schema({
  id: String,
  type: String,
  time: Number,
  isPublic: Boolean,
  previewId: String,
  secret: import_mongoose.Schema.Types.Mixed,
  metadata: import_mongoose.Schema.Types.Mixed
});
var Document;
var prepare = () => {
  Document = import_mongoose.default.model("Document", DocumentSchema, "Document");
};

// database/schemas/preview.schema.ts
var import_mongoose2 = __toESM(require("mongoose"));
var PreviewSchema = new import_mongoose2.Schema({
  id: String
});
var Preview;
var prepare2 = () => {
  Preview = import_mongoose2.default.model("Preview", PreviewSchema, "Preview");
};

// config.ts
var config = {
  LIARA_ENDPOINT: "storage.iran.liara.space",
  LIARA_BUCKET_NAME: "monopole",
  LIARA_ACCESS_KEY: "l2lt4s4m21mi6bf8",
  LIARA_SECRET_KEY: "5c967b73-65b7-42e0-a66d-698bc416acda",
  MONGODB_URI: ""
};
var setupConfig = (c) => {
  for (let key in config) {
    config[key] = c[key];
  }
};
var config_default = config;

// database/transactions/upload.ts
var import_fs2 = __toESM(require("fs"));
var import_mongoose4 = __toESM(require("mongoose"));

// database/drivers/main-driver.ts
var import_mongoose3 = __toESM(require("mongoose"));
var import_client_s3 = require("@aws-sdk/client-s3");
var connectMongoClient = () => {
  import_mongoose3.default.connect(
    config_default.MONGODB_URI,
    (err) => {
      if (err) {
        console.error("FAILED TO CONNECT TO MONGODB");
        console.error(err);
      } else {
        console.log("CONNECTED TO MONGODB");
      }
    }
  );
};
var s3Client;
var connectToS3 = () => __async(void 0, null, function* () {
  const client = new import_client_s3.S3Client({
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
var crypto = __toESM(require("crypto"));
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
var import_child_process = require("child_process");
var import_fs = __toESM(require("fs"));
var import_pdf2pic = require("pdf2pic");
var import_simple_thumbnail = __toESM(require("simple-thumbnail"));
var import_sharp = __toESM(require("sharp"));
var import_get_audio_duration = require("get-audio-duration");
var import_image_size = __toESM(require("image-size"));
var generatePreview = (documentId, previewId, type, extension) => {
  return new Promise((resolve) => {
    if (type === "application" && extension === "pdf") {
      let tempFilePath = process.cwd() + "/" + folders_default.TEMP + "/" + documentId + ".pdf";
      let rawFilePath = process.cwd() + "/" + folders_default.FILES + "/" + documentId;
      import_fs.default.copyFileSync(rawFilePath, tempFilePath);
      const options = {
        density: 100,
        saveFilename: documentId,
        savePath: process.cwd() + "/" + folders_default.PDF_PAGES,
        format: "png",
        width: 1080,
        height: 1920
      };
      (0, import_pdf2pic.fromPath)(tempFilePath, options).bulk(-1, true).then((output) => {
        import_fs.default.rmSync(tempFilePath);
        import_fs.default.mkdirSync(process.cwd() + "/" + folders_default.PDF_PAGES + "/" + previewId);
        for (let i = 0; i < output.length; i++) {
          import_fs.default.writeFileSync(
            process.cwd() + "/" + folders_default.PDF_PAGES + "/" + previewId + "/" + i + ".png",
            output[i].base64,
            "base64"
          );
        }
        resolve({});
      });
    } else if (type === "video") {
      (0, import_simple_thumbnail.default)(
        process.cwd() + "/" + folders_default.FILES + "/" + documentId,
        process.cwd() + "/" + folders_default.PREVIEWS + "/" + previewId + ".jpg",
        "256x196"
      ).then(() => {
        resolve({});
      }).catch((err) => console.error(err));
    } else if (type === "image") {
      const rawPreviewPath = process.cwd() + "/" + folders_default.PREVIEWS + "/" + previewId + ".jpg";
      (0, import_sharp.default)(process.cwd() + "/" + folders_default.FILES + "/" + documentId).resize(200, 200).toFile(rawPreviewPath, function(err) {
        const finalPreviewPath = process.cwd() + "/" + folders_default.PREVIEWS + "/" + previewId;
        import_fs.default.renameSync(rawPreviewPath, finalPreviewPath);
        (0, import_image_size.default)(finalPreviewPath, function(err2, dimensions) {
          resolve({ width: dimensions.width, height: dimensions.height });
        });
      });
    } else if (type === "audio") {
      const tempFilePath = process.cwd() + "/" + folders_default.TEMP + "/" + documentId + "." + extension;
      const tempMp3FilePath = process.cwd() + "/" + folders_default.TEMP + "/" + documentId + ".mp3";
      import_fs.default.copyFileSync(process.cwd() + "/" + folders_default.FILES + "/" + documentId, tempFilePath);
      let calculatingGraph = () => {
        (0, import_child_process.exec)(
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
              duration = yield (0, import_get_audio_duration.getAudioDurationInSeconds)(extension === "mp3" ? tempMp3FilePath : tempFilePath);
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
              import_fs.default.writeFile(process.cwd() + "/" + folders_default.PREVIEWS + "/" + previewId + ".jpg", cover2.data, () => {
                (0, import_sharp.default)(process.cwd() + "/" + folders_default.PREVIEWS + "/" + previewId + ".jpg").resize(200, 200).toFile(process.cwd() + "/" + folders_default.PREVIEWS + "/" + previewId, function(err) {
                  console.log("generated cover.");
                  import_fs.default.rmSync(process.cwd() + "/" + folders_default.PREVIEWS + "/" + previewId + ".jpg");
                  import_fs.default.renameSync(
                    process.cwd() + "/" + folders_default.PREVIEWS + "/" + previewId,
                    process.cwd() + "/" + folders_default.PREVIEWS + "/" + previewId + ".jpg"
                  );
                  if (import_fs.default.existsSync(tempFilePath))
                    import_fs.default.rmSync(tempFilePath);
                  if (import_fs.default.existsSync(tempMp3FilePath))
                    import_fs.default.rmSync(tempMp3FilePath);
                  resolve({ duration });
                });
              });
            } else {
              console.log("cover generation failed.");
              if (import_fs.default.existsSync(tempFilePath))
                import_fs.default.rmSync(tempFilePath);
              if (import_fs.default.existsSync(tempMp3FilePath))
                import_fs.default.rmSync(tempMp3FilePath);
              resolve({ duration });
            }
          })
        );
      };
      if (extension === "aac" || extension === "ogg") {
        (0, import_child_process.exec)(
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
var import_client_s32 = require("@aws-sdk/client-s3");
function getFilesizeInBytes(filename) {
  var stats = import_fs2.default.statSync(filename);
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}
var finalup = (path, roomId, humanId, isPublic, extension, type) => __async(void 0, null, function* () {
  const session = yield import_mongoose4.default.startSession();
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
    Body: import_fs2.default.createReadStream(path)
  };
  try {
    yield s3Client.send(new import_client_s32.PutObjectCommand(params));
    let { duration, width, height } = yield previewer_exports.generatePreview(document2.id, preview2.id, type, extension);
    yield import_fs2.default.promises.rm(path);
    if (duration || width && height) {
      const session2 = yield import_mongoose4.default.startSession();
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
var import_client_s33 = require("@aws-sdk/client-s3");
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
          const data = yield s3Client.send(new import_client_s33.GetObjectCommand(params));
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
          const data = yield s3Client.send(new import_client_s33.GetObjectCommand(params));
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
            const data = yield s3Client.send(new import_client_s33.GetObjectCommand(params));
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

// database/schemas/index.ts
var build = () => {
  prepare();
  prepare2();
};

// database/initiators/main-initiator.ts
var import_fs3 = __toESM(require("fs"));
var setupDatabase = () => __async(void 0, null, function* () {
  connectMongoClient();
  yield connectToS3();
  build();
  if (!import_fs3.default.existsSync(process.cwd() + "/data"))
    import_fs3.default.mkdirSync(process.cwd() + "/data");
  if (!import_fs3.default.existsSync(process.cwd() + "/data/files"))
    import_fs3.default.mkdirSync(process.cwd() + "/data/files");
  if (!import_fs3.default.existsSync(process.cwd() + "/data/previews"))
    import_fs3.default.mkdirSync(process.cwd() + "/data/previews");
  if (!import_fs3.default.existsSync(process.cwd() + "/data/temp"))
    import_fs3.default.mkdirSync(process.cwd() + "/data/temp");
  if (!import_fs3.default.existsSync(process.cwd() + "/data/pdf-pages"))
    import_fs3.default.mkdirSync(process.cwd() + "/data/pdf-pages");
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
//# sourceMappingURL=index.js.map