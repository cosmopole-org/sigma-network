
import folders from '../folders';
import { exec } from "child_process";
import fs from "fs";
import { fromPath } from "pdf2pic";
import genThumbnail from "simple-thumbnail";
import sharp from "sharp";
import { getAudioDurationInSeconds } from 'get-audio-duration';
import sizeOf from 'image-size';

const generatePreview = (documentId: string, previewId: string, type: string, extension: string): Promise<{ width?: number, height?: number, duration?: number, previewPath: string }> => {
    return new Promise(resolve => {
        if (type === "application" && extension === 'pdf') {
            let tempFilePath = process.cwd() + "/" + folders.TEMP + "/" + documentId + ".pdf";
            let rawFilePath = process.cwd() + "/" + folders.FILES + "/" + documentId;
            fs.copyFileSync(rawFilePath, tempFilePath);
            const options = {
                density: 100,
                saveFilename: documentId,
                savePath: process.cwd() + "/" + folders.PDF_PAGES,
                format: "jpg",
                width: 300,
                height: 400,
            };
            fromPath(tempFilePath, options).bulk(1, true).then((output: any) => {
                fs.rmSync(tempFilePath);
                if (output.length > 0) {
                    fs.writeFileSync(
                        process.cwd() + "/" + folders.PREVIEWS + "/" + previewId + ".jpg",
                        output[0].base64,
                        "base64"
                    );
                }
                resolve({ previewPath: process.cwd() + "/" + folders.PREVIEWS + "/" + previewId + ".jpg" });
            });
        } else if (type === 'video') {
            genThumbnail(
                process.cwd() + "/" + folders.FILES + "/" + documentId,
                process.cwd() + "/" + folders.PREVIEWS + "/" + previewId + ".jpg",
                "256x196"
            )
                .then(() => {
                    resolve({ previewPath: process.cwd() + "/" + folders.PREVIEWS + "/" + previewId + ".jpg" });
                })
                .catch((err) => console.error(err));
        } else if (type === 'image') {
            const finalPreviewPath = process.cwd() + "/" + folders.PREVIEWS + "/" + previewId + '.jpg';
            sharp(process.cwd() + "/" + folders.FILES + "/" + documentId)
                .resize(200, 200)
                .toFile(finalPreviewPath, function (err) {
                    sizeOf(finalPreviewPath, function (err, dimensions) {
                        resolve({
                            width: dimensions.width,
                            height: dimensions.height,
                            previewPath: finalPreviewPath
                        });
                    });
                });
        } else if (type === "audio") {
            const tempFilePath = process.cwd() + "/" + folders.TEMP + "/" + documentId + "." + extension;
            const tempMp3FilePath = process.cwd() + "/" + folders.TEMP + "/" + documentId + ".mp3";
            fs.copyFileSync(process.cwd() + "/" + folders.FILES + "/" + documentId, tempFilePath);
            let calculatingGraph = () => {
                exec(
                    `ffmpeg -i ${extension === 'mp3' ? tempMp3FilePath : tempFilePath} -f wav - | audiowaveform --input-format wav --output-format json --pixels-per-second 2 -b 8 > ${process.cwd() + "/" + folders.PREVIEWS + "/" + previewId + ".json"}`,
                    async (error, stdout, stderr) => {
                        if (error) {
                            console.log(`error: ${error}`);
                        }
                        if (stderr) {
                            console.log(`stderr: ${stderr}`);
                        }
                        console.log('generated waveform.');
                        console.log('measuring duration...');
                        let duration = undefined;
                        try {
                            duration = await getAudioDurationInSeconds(extension === 'mp3' ? tempMp3FilePath : tempFilePath);
                        } catch (ex) { }
                        console.log('generating cover...');
                        let cover;
                        try {
                            const { parseFile, selectCover } = await import("music-metadata");
                            const { common } = await parseFile(extension === 'mp3' ? tempMp3FilePath : tempFilePath);
                            cover = selectCover(common.picture);
                        } catch (ex) { }
                        if (cover) {
                            fs.writeFile(process.cwd() + "/" + folders.PREVIEWS + "/" + previewId + ".jpg", cover.data, () => {
                                sharp(process.cwd() + "/" + folders.PREVIEWS + "/" + previewId + ".jpg")
                                    .resize(200, 200)
                                    .toFile(process.cwd() + "/" + folders.PREVIEWS + "/" + previewId, function (err) {
                                        console.log('generated cover.');
                                        fs.rmSync(process.cwd() + "/" + folders.PREVIEWS + "/" + previewId + ".jpg");
                                        fs.renameSync(
                                            process.cwd() + "/" + folders.PREVIEWS + "/" + previewId,
                                            process.cwd() + "/" + folders.PREVIEWS + "/" + previewId + ".jpg"
                                        );
                                        if (fs.existsSync(tempFilePath)) fs.rmSync(tempFilePath);
                                        if (fs.existsSync(tempMp3FilePath)) fs.rmSync(tempMp3FilePath);
                                        resolve({ duration, previewPath: process.cwd() + "/" + folders.PREVIEWS + "/" + previewId + ".jpg" });
                                    });
                            });
                        } else {
                            console.log('cover generation failed.');
                            if (fs.existsSync(tempFilePath)) fs.rmSync(tempFilePath);
                            if (fs.existsSync(tempMp3FilePath)) fs.rmSync(tempMp3FilePath);
                            resolve({ duration, previewPath: "" });
                        }
                    });
            };
            if (extension === "aac" || extension === 'ogg') {
                exec(
                    `ffmpeg -i ${tempFilePath} -vn -ar 44100 -ac 2 -b:a 192k ${tempMp3FilePath}`,
                    (error, stdout, stderr) => {
                        extension = "mp3";
                        console.log('generated mp3.');
                        calculatingGraph();
                    }
                );
            } else {
                calculatingGraph();
            }
        } else {
            resolve({ previewPath: "" });
        }
    })
}

export {
    generatePreview
}
