// @flow

import React, { PureComponent } from 'react'

import type { Node } from 'react'
import type { Device } from 'types/common'

import EnsureDevice from './EnsureDevice'
import EnsureDashboard from './EnsureDashboard'
import EnsureGenuine from './EnsureGenuine'

type DeviceInfo = {
  targetId: number | string,
  version: string,
  final: boolean,
  mcu: boolean,
}

type Error = {
  message: string,
  stack: string,
}

type Props = {
  renderDefault: (
    device: ?Device,
    deviceInfo: ?DeviceInfo,
    isGenuine: ?boolean,
    error: {
      dashboardError: ?Error,
      genuineError: ?Error,
    },
  ) => Node,
  renderMcuUpdate?: (deviceInfo: DeviceInfo) => Node,
  renderFinalUpdate?: (deviceInfo: DeviceInfo) => Node,
  renderDashboard?: (device: Device, deviceInfo: DeviceInfo, isGenuine: boolean) => Node,
  onGenuineCheck?: (isGenuine: boolean) => void,
  renderError?: (dashboardError: ?Error, genuineError: ?Error) => Node,
}
type State = {}

class Workflow extends PureComponent<Props, State> {
  render() {
    const {
      renderDashboard,
      renderFinalUpdate,
      renderMcuUpdate,
      renderError,
      renderDefault,
      onGenuineCheck,
    } = this.props
    return (
      <EnsureDevice>
        {(device: Device) => (
          <EnsureDashboard device={device}>
            {(deviceInfo: ?DeviceInfo, dashboardError: ?Error) => (
              <EnsureGenuine device={device} infos={deviceInfo}>
                {(isGenuine: ?boolean, genuineError: ?Error) => {
                  if (dashboardError || genuineError) {
                    return renderError
                      ? renderError(dashboardError, genuineError)
                      : renderDefault(device, deviceInfo, isGenuine, {
                          genuineError,
                          dashboardError,
                        })
                  }

                  if (deviceInfo && deviceInfo.mcu && renderMcuUpdate) {
                    return renderMcuUpdate(deviceInfo)
                  }

                  if (deviceInfo && deviceInfo.final && renderFinalUpdate) {
                    return renderFinalUpdate(deviceInfo)
                  }

                  if (isGenuine && deviceInfo && device && !dashboardError && !genuineError) {
                    if (onGenuineCheck) onGenuineCheck(isGenuine)

                    if (renderDashboard) return renderDashboard(device, deviceInfo, isGenuine)
                  }

                  return renderDefault(device, deviceInfo, isGenuine, {
                    genuineError,
                    dashboardError,
                  })
                }}
              </EnsureGenuine>
            )}
          </EnsureDashboard>
        )}
      </EnsureDevice>
    )
  }
}

export default Workflow