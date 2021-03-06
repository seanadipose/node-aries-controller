import {
  IInvitationRequest,
  IInvitationRequestResponse,
  IReceiveInvitationRequestResponse
} from '../../../core/interfaces/invitation-request.interface';
import * as request from 'superagent';
import { MessageState } from '../../../core/interfaces/agent.interface';
import {
  IConnectionParams,
  IConnectionsResult
} from '../../../core/interfaces/connection.interface';

const segment = 'connections/';

export class ConnectionService {
  apiUrl: string;
  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  /*
    create an invitation to share with another agent.
  */

  async createInvitation(): Promise<IInvitationRequestResponse> {
    try {
      const res = await request
        .post(`${this.apiUrl}connections/create-invitation`)
        .set('Content-Type', 'application/json');
      if (res.status === 200) return res.body as IInvitationRequestResponse;
      throw new Error('Create invitation failed');
    } catch (err) {
      return err;
    }
  }

  /*
    Receive an invitation from an outside source.
  */

  async receiveInvitation(
    invitation: IInvitationRequest,
    accept: boolean = true,
    params?: IConnectionParams
  ): Promise<IReceiveInvitationRequestResponse> {
    const res = await request
      .post(`${this.apiUrl}connections/receive-invitation`)
      .send(invitation);
    return res.body;
  }

  /*
    Accept an invitation by Id. Called after receiving an
    invitation from another agent.

  */

  async acceptInvitation(id: string) {
    try {
      const res = await request.post(
        `${this.apiUrl}connections/${id}/accept-invitation`
      );

      return res.body;
    } catch (err) {
      throw new Error('accept invitation failed');
    }
  }

  /*
    Accept request responds to an invitation that has been sent to
    and accepted by another agent
  */

  async acceptRequest(id: string) {
    try {
      const res = await request.post(
        `${this.apiUrl}connections/${id}/accept-request`
      );
      return res.body;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  /*
    lists all connections. Optional parameter to list
    a specific connection.
  */

  async connections(
    id: string | null = null,
    params: IConnectionParams = {}
  ): Promise<IConnectionsResult | IConnectionsResult[]> {
    try {
      const res =
        id != null
          ? await request.get(`${this.apiUrl}connections/${id}`)
          : await request.get(`${this.apiUrl}connections`).query(params);
      return res.body.results || res.body;
    } catch (err) {
      throw new Error('connections call failed');
    }
  }

  /*
    Assign another connection as the inbound connection
  */
  async establishInbound(id: string, refId: string) {
    return 'method not implemented';
  }

  /*

    TODO: Pull this out of the code. It simply formats an invitation for
    sending to an external agent.
  */

  /*
    send basic message to a connection (by connection id)
  */
  async sendMessage(id: string) {
    try {
      const res = await request.get(
        `${this.apiUrl}connections/${id}/send-message`
      );
      return res.body;
    } catch (err) {
      throw err.message;
    }
  }

  /*
    Remove existing connection record. Use this to "reject" a sent connection
  */
  async sendRemoveConnection(id: string): Promise<any> {
    try {
      const url = `${this.apiUrl}${segment}${id}/remove`;
      const res = await request.post(url);
      // console.log('return result from the remove connection', res);
      return res.body;
    } catch (err) {
      return err;
    }
  }

  /*
    remove all connections
  */
  async removeAllConnections() {
    const connections = this.connections();
    if (Array.isArray(connections)) {
      for (const connection of connections) {
        try {
          await this.sendRemoveConnection(connection.connection_id);
        } catch (err) {
          return err;
        }
      }
    }
  }
}
