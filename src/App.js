import React, { useEffect, useState } from "react";
import {
  Flex,
  Button,
  Form,
  Upload,
  Image,
  Select,
  Card,
  notification,
  Divider,
} from "antd";
import { PlusOutlined, DownloadOutlined } from "@ant-design/icons";
import axios from "axios";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const App = () => {
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [type, setType] = useState("dc");
  const [modelFileList, setModelFileList] = useState([]);
  const [clothesFileList, setClothesFileList] = useState([]);
  const [imageGenerated, setImageGenerated] = useState("");
  const [form] = Form.useForm();

  const handleModelChange = ({ fileList: newFileList }) =>
    setModelFileList(newFileList);

  const handleClothesChange = ({ fileList: newFileList }) =>
    setClothesFileList(newFileList);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const submit = async (values) => {
    try {
      setLoading(true);
      values.model = values.model.fileList[0].originFileObj;
      values.clothes = values.clothes.fileList[0].originFileObj;

      const formData = new FormData();
      formData.append("model", values.model);
      formData.append("clothes", values.clothes);
      formData.append("option", values.option);
      if (values.part) {
        formData.append("part", values.part);
      }
      const response = await axios.post(
        "http://34.148.69.171:5555/generate",
        formData
      );
      if (response.status === 200) {
        api.success({
          message: `Success!`,
          description: "Image generated successfully",
          placement: "topRight",
        });
        setImageGenerated(response.data.image_path);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      api.error({
        message: `Error!`,
        description: "Somthing went wrong!!!",
        placement: "topRight",
      });
    }
  };

  const onDownload = () => {
    fetch(imageGenerated)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.download = "image.png";
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
        link.remove();
      });
  };

  useEffect(() => {
    form.setFieldsValue({
      option: "dc",
    });
    setType("dc");
  }, [form]);

  useEffect(() => {
    if (type === "hd") {
      form.setFieldValue("part", "top");
    }
  }, [type]);

  return (
    <Card
      style={{
        padding: 0,
        margin: "auto",
        maxWidth: 335,
        marginTop: 20,
        marginBottom: 20,
      }}
      title="Superba AR"
    >
      {contextHolder}
      <Form
        name="basic"
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        style={{ width: "100%" }}
        onFinish={submit}
        autoComplete="off"
      >
        <Form.Item
          label="Model"
          name="model"
          rules={[
            {
              required: true,
              message: "Please upload model!",
            },
          ]}
        >
          <Upload
            beforeUpload={() => false}
            listType="picture-card"
            maxCount={1}
            onChange={handleModelChange}
            onPreview={handlePreview}
            showUploadList={{ showRemoveIcon: false }}
            accept="image/*"
            fileList={modelFileList}
          >
            <button
              style={{ border: 0, background: "none", cursor: "pointer" }}
              type="button"
            >
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload File</div>
            </button>
          </Upload>
        </Form.Item>

        <Form.Item
          label="Clothes"
          name="clothes"
          rules={[
            {
              required: true,
              message: "Please upload clothes!",
            },
          ]}
        >
          <Upload
            beforeUpload={() => false}
            listType="picture-card"
            maxCount={1}
            onPreview={handlePreview}
            showUploadList={{ showRemoveIcon: false }}
            accept="image/*"
            fileList={clothesFileList}
            onChange={handleClothesChange}
          >
            <button
              style={{ border: 0, background: "none", cursor: "pointer" }}
              type="button"
            >
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload File</div>
            </button>
          </Upload>
        </Form.Item>

        <Form.Item
          label="Type"
          name="option"
          rules={[
            {
              required: true,
              message: "Please select type!",
            },
          ]}
        >
          <Select onChange={(value) => setType(value)}>
            <Select.Option value="dc">Full Body</Select.Option>
            <Select.Option value="hd">Half Body</Select.Option>
          </Select>
        </Form.Item>

        {type === "hd" ? (
          <Form.Item
            label="Part"
            name="part"
            rules={[
              {
                required: true,
                message: "Please select body part!",
              },
            ]}
          >
            <Select>
              <Select.Option value="top">Top</Select.Option>
              {/* <Select.Option value="bottom">Bottom</Select.Option> */}
            </Select>
          </Form.Item>
        ) : null}

        <Form.Item
          wrapperCol={{ offset: 6, span: 18 }}
          style={{ marginBottom: 0, marginTop: 30 }}
        >
          <Flex justify="flex-end" gap={10}>
            <Button
              onClick={() => {
                form.setFieldsValue({ option: "dc" });
                setType("dc");
                setModelFileList([]);
                setClothesFileList([]);
                setImageGenerated("");
              }}
            >
              Reset
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </Flex>
        </Form.Item>
        {imageGenerated !== "" ? (
          <React.Fragment>
            <Divider style={{ marginTop: 10, marginBottom: 10 }} />
            <Image width={"100%"} src={imageGenerated} />
            <Flex justify="center">
              <Button
                icon={<DownloadOutlined />}
                onClick={onDownload}
                style={{ marginTop: 10 }}
              >
                Download
              </Button>
            </Flex>
          </React.Fragment>
        ) : null}
        {previewImage && (
          <Image
            wrapperStyle={{ display: "none" }}
            preview={{
              visible: previewOpen,
              onVisibleChange: (visible) => setPreviewOpen(visible),
              afterOpenChange: (visible) => !visible && setPreviewImage(""),
            }}
            src={previewImage}
          />
        )}
      </Form>
    </Card>
  );
};

export default App;
