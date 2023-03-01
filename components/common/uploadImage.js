import { Upload, message } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { generate, generate as stringGenerator } from "randomstring";
import firebaseInit from "../../utils/firebaseInit";
import "firebase/storage";

import Resizer from "react-image-file-resizer";

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isImage = file.type.indexOf("image/") === 0;
  if (!isImage) {
    message.error("حصل خطأ يرجى رفع الصور فقط");
  }
  return isImage;
}

export default function UploadImage(props) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(undefined);

  useEffect(() => {
    setImageUrl(props.image);
  }, [props.image]);

  const handleChange = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      getBase64(info.file.originFileObj, (imageUrl) => {
        setImageUrl(imageUrl);
        setLoading(false);
      });
    }
  };

  const customUpload = async ({ onError, onSuccess, file }) => {
    const resizedImage = await resizeFile(file);

    const storage = firebaseInit.storage();
    const metadata = {
      contentType: "image/jpeg",
    };
    const storageRef = storage.ref();
    const imageName = generate(20); //a unique name for the image
    const imgFile = storageRef.child(`images/${imageName}.jpg`);
    try {
      const image = await imgFile.put(resizedImage, metadata);
      const uploadedFileUrl = await firebaseInit
        .storage()
        .ref("images")
        .child(`${imageName}.jpg`)
        .getDownloadURL();

      props.onUpdate(uploadedFileUrl);
      onSuccess(null, image);
    } catch (e) {
      onError(e);
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );
  return (
    <Upload
      name="avatar"
      showUploadList={false}
      listType="picture-card"
      beforeUpload={beforeUpload}
      onChange={handleChange}
      customRequest={customUpload}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="Image" style={{ width: 102, height: 102 }} />
      ) : (
        uploadButton
      )}
    </Upload>
  );
}

const resizeFile = (file) =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      300,
      300,
      "JPEG",
      100,
      0,
      (uri) => {
        resolve(uri);
      },
      "file"
    );
  });
