import React, { useState } from "react";
import logo from "../../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useHttpRequestService } from "../../../service/HttpRequestService";
import AuthWrapper from "../AuthWrapper";
import LabeledInput from "../../../components/labeled-input/LabeledInput";
import Button from "../../../components/button/Button";
import { ButtonType } from "../../../components/button/StyledButton";
import { StyledH3 } from "../../../components/common/text";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const httpRequestService = useHttpRequestService();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth();
  const { showError } = useToast();

  const handleSubmit = async () => {
    try {
      const success = await httpRequestService.signIn({ email, password });
      if (success) {
        const token = localStorage.getItem("token");
        if (token) {
          await login(token);
        }
        navigate("/");
      }
    } catch (error) {
      setError(true);
      showError("Invalid email or password. Please try again.");
    }
  };

  return (
    <AuthWrapper>
      <div className={"border"}>
        <div className={"container"}>
          <div className={"header"}>
            <img src={logo} alt={"Twitter Logo"} />
            <StyledH3>{t("title.login")}</StyledH3>
          </div>
          <div className={"input-container"}>
            <LabeledInput
              required
              placeholder={"Enter user..."}
              title={t("input-params.username")}
              error={error}
              onChange={(e) => setEmail(e.target.value)}
            />
            <LabeledInput
              type="password"
              required
              placeholder={"Enter password..."}
              title={t("input-params.password")}
              error={error}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className={"error-message"}>{error && t("error.login")}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Button
              text={t("buttons.login")}
              buttonType={ButtonType.FOLLOW}
              size={"MEDIUM"}
              onClick={handleSubmit}
            />
            <Button
              text={t("buttons.register")}
              buttonType={ButtonType.OUTLINED}
              size={"MEDIUM"}
              onClick={() => navigate("/sign-up")}
            />
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default SignInPage;
