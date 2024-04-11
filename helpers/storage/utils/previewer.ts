
import folders from '../folders';
import { exec } from "child_process";
import fs from "fs";
import { fromPath } from "pdf2pic";
import genThumbnail from "simple-thumbnail";
import sharp from "sharp";
import { getAudioDurationInSeconds } from 'get-audio-duration';
import sizeOf from 'image-size';

const generatePreview = (documentPath: string, documentId: string, previewId: string, type: string, extension: string): Promise<{ width?: number, height?: number, duration?: number, previewPath: string, waveformPath?: string, videoParts?: string }> => {
    return new Promise(resolve => {
        if (type === "application" && extension === 'pdf') {
            let tempFilePath = folders.TEMP + "/" + documentId + ".pdf";
            fs.copyFileSync(documentPath, tempFilePath);
            const options = {
                density: 100,
                saveFilename: documentId,
                savePath: folders.PDF_PAGES,
                format: "jpg",
                width: 300,
                height: 400,
            };
            fromPath(tempFilePath, options).bulk(1, true).then((output: any) => {
                fs.rmSync(tempFilePath);
                if (output.length > 0) {
                    fs.writeFileSync(
                        folders.PREVIEWS + "/" + previewId + ".jpg",
                        output[0].base64,
                        "base64"
                    );
                }
                resolve({ previewPath: folders.PREVIEWS + "/" + previewId + ".jpg" });
            });
        } else if (type === 'video') {
            genThumbnail(
                documentPath,
                folders.PREVIEWS + "/" + previewId + ".jpg",
                "256x196"
            )
                .then(() => {
                    resolve({
                        previewPath: folders.PREVIEWS + "/" + previewId + ".jpg"
                    });
                })
                .catch((err) => console.error(err));
        } else if (type === 'image') {
            const finalPreviewPath = folders.PREVIEWS + "/" + previewId + '.jpg';
            sharp(documentPath)
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
            const tempFilePath = folders.TEMP + "/" + documentId + "." + extension;
            const tempMp3FilePath = folders.TEMP + "/" + documentId + ".mp3";
            fs.copyFileSync(documentPath, tempFilePath);
            let calculatingGraph = () => {
                exec(
                    `ffmpeg -i ${extension === 'mp3' ? tempMp3FilePath : tempFilePath} -f wav - | audiowaveform --input-format wav --output-format json --pixels-per-second 2 -b 8 > ${folders.PREVIEWS + "/" + previewId + ".json"}`,
                    async (error, stdout, stderr) => {
                        console.log(stdout)
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
                        } catch (ex) { console.log(ex) }
                        console.log('generating cover...');
                        let cover;
                        try {
                            let { parseFile, selectCover } = await import("music-metadata")
                            const { common } = await parseFile(extension === 'mp3' ? tempMp3FilePath : tempFilePath);
                            cover = selectCover(common.picture);
                        } catch (ex) { console.log(ex) }
                        if (cover) {
                            fs.writeFile(folders.PREVIEWS + "/" + previewId + ".jpg", cover.data, { flag: 'w' }, () => {
                                sharp(folders.PREVIEWS + "/" + previewId + ".jpg")
                                    .resize(200, 200)
                                    .toFile(folders.PREVIEWS + "/" + previewId, function (err) {
                                        console.log('generated cover.');
                                        fs.rmSync(folders.PREVIEWS + "/" + previewId + ".jpg");
                                        fs.renameSync(
                                            folders.PREVIEWS + "/" + previewId,
                                            folders.PREVIEWS + "/" + previewId + ".jpg"
                                        );
                                        if (fs.existsSync(tempFilePath)) fs.rmSync(tempFilePath);
                                        if (fs.existsSync(tempMp3FilePath)) fs.rmSync(tempMp3FilePath);
                                        resolve({
                                            duration,
                                            previewPath: folders.PREVIEWS + "/" + previewId + ".jpg",
                                            waveformPath: fs.existsSync(folders.PREVIEWS + "/" + previewId + ".json") ?
                                                (folders.PREVIEWS + "/" + previewId + ".json") :
                                                undefined
                                        });
                                    });
                            });
                        } else {
                            console.log('cover generation failed.');
                            if (fs.existsSync(tempFilePath)) fs.rmSync(tempFilePath);
                            if (fs.existsSync(tempMp3FilePath)) fs.rmSync(tempMp3FilePath);
                            resolve({
                                duration,
                                previewPath: "",
                                waveformPath: fs.existsSync(folders.PREVIEWS + "/" + previewId + ".json") ?
                                    (folders.PREVIEWS + "/" + previewId + ".json") :
                                    undefined
                            });
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
