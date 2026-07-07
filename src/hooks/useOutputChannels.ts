import { useCallback, useRef, useState } from 'react';
import {
  DEFAULT_OUTPUT_CHANNEL,
  OUTPUT_CHANNELS,
  type OutputChannelId,
} from '../config/output-channels';

export interface OutputLine {
  id: string;
  text: string;
}

function emptyChannelState(): Record<OutputChannelId, OutputLine[]> {
  return {
    studio: [],
    tasks: [],
    ratary: [],
    terminal: [],
  };
}

export function useOutputChannels() {
  const [activeChannelId, setActiveChannelId] = useState<OutputChannelId>(DEFAULT_OUTPUT_CHANNEL);
  const [channels, setChannels] = useState<Record<OutputChannelId, OutputLine[]>>(emptyChannelState);
  const [scrollLock, setScrollLock] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const scrollLockRef = useRef(scrollLock);
  scrollLockRef.current = scrollLock;

  const appendToChannel = useCallback((channelId: OutputChannelId, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setChannels((prev) => ({
      ...prev,
      [channelId]: [
        ...prev[channelId],
        { id: crypto.randomUUID(), text: trimmed },
      ],
    }));
  }, []);

  const appendLinesToChannel = useCallback((channelId: OutputChannelId, text: string) => {
    const parts = text.split('\n').filter((line) => line.length > 0);
    if (parts.length === 0) return;
    setChannels((prev) => ({
      ...prev,
      [channelId]: [
        ...prev[channelId],
        ...parts.map((line) => ({ id: crypto.randomUUID(), text: line })),
      ],
    }));
  }, []);

  const clearChannel = useCallback((channelId: OutputChannelId) => {
    setChannels((prev) => ({ ...prev, [channelId]: [] }));
  }, []);

  const clearAllChannels = useCallback(() => {
    setChannels(emptyChannelState());
  }, []);

  const activeLines = channels[activeChannelId] ?? [];

  return {
    channels: OUTPUT_CHANNELS,
    channelLines: channels,
    activeChannelId,
    setActiveChannelId,
    activeLines,
    appendToChannel,
    appendLinesToChannel,
    clearChannel,
    clearAllChannels,
    scrollLock,
    setScrollLock,
    scrollLockRef,
    wordWrap,
    setWordWrap,
  };
}
