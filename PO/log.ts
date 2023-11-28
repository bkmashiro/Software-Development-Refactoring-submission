export enum LogLevel {
  INFO,
  DEBUG,
  WARN,
  ERROR,
}

export function log(level: LogLevel = LogLevel.DEBUG, message: string): void {
  const date = new Date()
  const time = date.toLocaleTimeString()
  const levelString = LogLevel[level]
  console.log(`[${time}] ${levelString} ${message}`)
}
