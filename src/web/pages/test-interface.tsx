import React from "react";
import { WarningCircle, GearSix } from "@phosphor-icons/react";
import { useChat } from "../features/chat/use-chat";
import { BMOFace } from "../components/bmo-face";
import { ChatLog } from "../components/chat-log";
import { Controls } from "../components/controls";
import { DebugMenu } from "../components/debug-menu";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import { Card, CardContent } from "../components/ui/card";

export function TestInterface() {
  const {
    state,
    messages,
    isRecording,
    error,
    speechSupported,
    handleSend,
    handleTalk,
    handleMockResponse,
  } = useChat();

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-6">
      <Card className="w-full bg-main">
        <CardContent className="flex flex-col items-center gap-2 p-4">
          <BMOFace state={state} />
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardContent className="flex flex-col items-center gap-4">
          <div className="w-full flex items-center justify-between">
            <Button variant="neutral" size="icon" title="Settings">
              <GearSix size={16} />
            </Button>
            <div className="flex items-center gap-3">
              <Badge variant="neutral" className="text-sm uppercase tracking-wider px-4 py-1">
                {state}
              </Badge>
              <DebugMenu onMockResponse={handleMockResponse} />
            </div>
          </div>
          {error && (
            <Alert variant="destructive" className="w-full">
              <WarningCircle size={16} />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <ChatLog messages={messages} />
          <Controls
            onSend={handleSend}
            onTalk={handleTalk}
            isRecording={isRecording}
            speechSupported={speechSupported}
          />
        </CardContent>
      </Card>
    </div>
  );
}
