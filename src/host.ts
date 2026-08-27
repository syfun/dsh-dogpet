/**
 * Dogpet Plugin - Host Half
 *
 * Listens to the `agent/status` event and exposes the current
 * agent status to the Client half via `harness.handle`.
 */

export default {
  apply(ctx: any) {
    let currentStatus = 'idle'
    let previousStatus = 'idle'

    // Listen to agent status changes (idle <-> running)
    ctx.on('agent/status', (payload: { status: string }) => {
      previousStatus = currentStatus
      currentStatus = payload.status
    })

    // Provide status query for client via JSON RPC
    harness.handle('getAgentStatus', async () => {
      return {
        status: currentStatus,
        previousStatus: previousStatus,
        changed: currentStatus !== previousStatus,
      }
    })
  },
}
