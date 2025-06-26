import logo from "../../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import AuthWrapper from "../../../pages/auth/AuthWrapper";
import { useHttpRequestService } from "../../../service/HttpRequestService";
import FormikLabeledInput from "../../../components/labeled-input/FormikLabeledInput";
import Button from "../../../components/button/Button";
import { ButtonType } from "../../../components/button/StyledButton";
import { StyledH3 } from "../../../components/common/text";
import { useAuth } from "../../../contexts/AuthContext";

interface SignUpData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Validation schema using Yup
const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .required("Name is required"),
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .required("Username is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

const SignUpPage = () => {
  const httpRequestService = useHttpRequestService();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth();

  const initialValues: SignUpData = {
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const handleSubmit = async (
    values: SignUpData,
    { setSubmitting, setStatus }: any
  ) => {
    try {
      const { confirmPassword, ...requestData } = values;
      const success = await httpRequestService.signUp(requestData);
      if (success) {
        const token = localStorage.getItem("token");
        if (token) {
          await login(token);
        }
        navigate("/");
      }
    } catch (error) {
      setStatus({ error: "Registration failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthWrapper>
      <div className={"border"}>
        <div className={"container"}>
          <div className={"header"}>
            <img src={logo} alt="Twitter Logo" />
            <StyledH3>{t("title.register")}</StyledH3>
          </div>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              isSubmitting,
              status,
              submitForm,
            }) => (
              <Form
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div className={"input-container"}>
                  <FormikLabeledInput
                    required
                    placeholder={"Enter name..."}
                    title={t("input-params.name")}
                    name="name"
                    value={values.name}
                    error={errors.name}
                    touched={touched.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <FormikLabeledInput
                    required
                    placeholder={"Enter username..."}
                    title={t("input-params.username")}
                    name="username"
                    value={values.username}
                    error={errors.username}
                    touched={touched.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <FormikLabeledInput
                    required
                    type="email"
                    placeholder={"Enter email..."}
                    title={t("input-params.email")}
                    name="email"
                    value={values.email}
                    error={errors.email}
                    touched={touched.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <FormikLabeledInput
                    type="password"
                    required
                    placeholder={"Enter password..."}
                    title={t("input-params.password")}
                    name="password"
                    value={values.password}
                    error={errors.password}
                    touched={touched.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <FormikLabeledInput
                    type="password"
                    required
                    placeholder={"Confirm password..."}
                    title={t("input-params.confirm-password")}
                    name="confirmPassword"
                    value={values.confirmPassword}
                    error={errors.confirmPassword}
                    touched={touched.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {status?.error && (
                    <p className={"error-message"}>{status.error}</p>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Button
                    text={
                      isSubmitting ? "Registering..." : t("buttons.register")
                    }
                    buttonType={ButtonType.FOLLOW}
                    size={"MEDIUM"}
                    onClick={submitForm}
                    disabled={isSubmitting}
                  />
                  <Button
                    text={t("buttons.login")}
                    buttonType={ButtonType.OUTLINED}
                    size={"MEDIUM"}
                    onClick={() => navigate("/sign-in")}
                  />
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default SignUpPage;
