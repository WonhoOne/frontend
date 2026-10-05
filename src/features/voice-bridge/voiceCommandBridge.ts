import type {
  VoiceCommand,
  VoiceCommandName,
  VoiceTheme,
  VoiceTourStyle,
  VoiceHotelOption,
  VoiceTransportOption,
  VoiceMealOption,
  VoiceExtraOption,
} from '../../integrations/voice/voiceCommand';

/** Synchronous selection capabilities supplied by the current Frontend composition. */
export interface VoiceBridgeCapabilities {
  showTours?: (theme?: VoiceTheme) => void;
  selectTheme?: (theme: VoiceTheme) => void;
  selectTourProduct?: (tourProductId: number) => void;
  selectStyle?: (style: VoiceTourStyle) => void;
  selectSchedule?: (scheduleId: number) => void;
  setParticipantCount?: (participantCount: number) => void;
  changeHotel?: (hotelOption: VoiceHotelOption) => void;
  changeTransport?: (transportOption: VoiceTransportOption) => void;
  changeMeal?: (mealOption: VoiceMealOption) => void;
  addOption?: (extraOption: VoiceExtraOption) => void;
  removeOption?: (extraOption: VoiceExtraOption) => void;
}

export type VoiceBridgeResult =
  | { ok: true; command: VoiceCommandName }
  | {
      ok: false;
      command: VoiceCommandName;
      error: { code: 'CAPABILITY_UNAVAILABLE' | 'CAPABILITY_FAILED' };
    };

/**
 * Dispatches an already validated canonical command to at most one capability.
 * Success means the synchronous handler returned; Feature integration and GUI
 * review remain the caller's responsibility. No state or retry is retained here.
 */
export function executeVoiceCommand(
  command: VoiceCommand,
  capabilities: VoiceBridgeCapabilities,
): VoiceBridgeResult {
  const name = command.command;
  try {
    switch (command.command) {
      case 'SHOW_TOURS':
        return invoke(name, capabilities.showTours, command.args.theme);
      case 'SELECT_THEME':
        return invoke(name, capabilities.selectTheme, command.args.theme);
      case 'SELECT_TOUR_PRODUCT':
        return invoke(name, capabilities.selectTourProduct, command.args.tourProductId);
      case 'SELECT_STYLE':
        return invoke(name, capabilities.selectStyle, command.args.style);
      case 'SELECT_SCHEDULE':
        return invoke(name, capabilities.selectSchedule, command.args.scheduleId);
      case 'SET_PARTICIPANT_COUNT':
        return invoke(name, capabilities.setParticipantCount, command.args.participantCount);
      case 'CHANGE_HOTEL':
        return invoke(name, capabilities.changeHotel, command.args.hotelOption);
      case 'CHANGE_TRANSPORT':
        return invoke(name, capabilities.changeTransport, command.args.transportOption);
      case 'CHANGE_MEAL':
        return invoke(name, capabilities.changeMeal, command.args.mealOption);
      case 'ADD_OPTION':
        return invoke(name, capabilities.addOption, command.args.extraOption);
      case 'REMOVE_OPTION':
        return invoke(name, capabilities.removeOption, command.args.extraOption);
      default:
        return unreachable(command);
    }
  } catch {
    return { ok: false, command: name, error: { code: 'CAPABILITY_FAILED' } };
  }
}

function invoke<Arg>(
  command: VoiceCommandName,
  handler: ((arg: Arg) => void) | undefined,
  arg: Arg,
): VoiceBridgeResult {
  if (handler === undefined) {
    return { ok: false, command, error: { code: 'CAPABILITY_UNAVAILABLE' } };
  }
  handler(arg);
  return { ok: true, command };
}

/** The never parameter makes additions to the canonical union a compile error. */
function unreachable(command: never): never {
  void command;
  throw new Error();
}
