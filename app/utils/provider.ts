import { Provider } from "../types";

export const presentProvider = (provider: Provider): string => {
  switch (provider) {
    case Provider.OPENAI:
      return "OpenAI";
    case Provider.AZURE:
      return "Azure OpenAI";
  }
};
