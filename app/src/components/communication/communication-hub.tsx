'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Mail,
  MessageSquare,
  Phone,
  Send,
  Calendar,
  Plus,
  History,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { useTwilioEnabled, useSendGridEnabled, useTelegramEnabled, useFirebaseEnabled } from '@/hooks/useConfig'

interface CommunicationChannel {
  id: string
  name: string
  icon: any
  enabled: boolean
  description: string
  capabilities: string[]
}

interface CommunicationLog {
  id: string
  channel: string
  type: 'sent' | 'received' | 'scheduled'
  recipient: string
  subject?: string
  content: string
  status: 'delivered' | 'sent' | 'failed' | 'pending'
  timestamp: Date
  cost?: number
}

export function CommunicationHub() {
  const [activeTab, setActiveTab] = useState('compose')
  const [selectedChannel, setSelectedChannel] = useState<string>('email')

  const twilioEnabled = useTwilioEnabled()
  const sendgridEnabled = useSendGridEnabled()
  const telegramEnabled = useTelegramEnabled()
  const firebaseEnabled = useFirebaseEnabled()

  const channels: CommunicationChannel[] = [
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      enabled: sendgridEnabled,
      description: 'Send professional emails with templates and tracking',
      capabilities: ['Templates', 'Tracking', 'Attachments', 'Scheduling'],
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: MessageSquare,
      enabled: twilioEnabled,
      description: 'Send text messages globally with delivery confirmation',
      capabilities: ['Global', 'Instant', 'Low Cost', 'High Open Rate'],
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageSquare,
      enabled: twilioEnabled,
      description: 'Business messaging with rich media and templates',
      capabilities: ['Rich Media', 'Templates', 'Business API', 'Two-way'],
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: MessageSquare,
      enabled: telegramEnabled,
      description: 'Bot-based messaging with channels and groups',
      capabilities: ['Bots', 'Channels', 'Groups', 'Files'],
    },
    {
      id: 'push',
      name: 'Push Notifications',
      icon: Phone,
      enabled: firebaseEnabled,
      description: 'Mobile app push notifications with targeting',
      capabilities: ['Mobile', 'Targeting', 'Rich Content', 'Analytics'],
    },
    {
      id: 'call',
      name: 'Voice Calls',
      icon: Phone,
      enabled: twilioEnabled,
      description: 'Programmable voice calls with IVR and recording',
      capabilities: ['IVR', 'Recording', 'Global', 'Programmable'],
    },
  ]

  const mockLogs: CommunicationLog[] = [
    {
      id: '1',
      channel: 'email',
      type: 'sent',
      recipient: 'john@client.com',
      subject: 'Q4 Financial Review',
      content: 'Please find attached our Q4 financial summary...',
      status: 'delivered',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: '2',
      channel: 'sms',
      type: 'sent',
      recipient: '+447700900001',
      content: 'Your appointment is confirmed for tomorrow at 2 PM',
      status: 'delivered',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      id: '3',
      channel: 'whatsapp',
      type: 'received',
      recipient: 'Sarah Smith',
      content: 'Thank you for the update. Looking forward to our meeting.',
      status: 'delivered',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
  ]

  const availableChannels = channels.filter(channel => channel.enabled)

  const getStatusIcon = (status: CommunicationLog['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'sent':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getChannelIcon = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId)
    if (!channel) return <Mail className="h-4 w-4" />
    const IconComponent = channel.icon
    return <IconComponent className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communication Hub</h1>
          <p className="text-muted-foreground">
            Manage all your business communications in one place
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Channel Selection */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Channel</CardTitle>
                <CardDescription>Choose how to send your message</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {availableChannels.map((channel) => {
                  const IconComponent = channel.icon
                  return (
                    <Button
                      key={channel.id}
                      variant={selectedChannel === channel.id ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setSelectedChannel(channel.id)}
                    >
                      <IconComponent className="h-4 w-4 mr-2" />
                      {channel.name}
                    </Button>
                  )
                })}
              </CardContent>
            </Card>

            {/* Message Composer */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Compose Message</CardTitle>
                <CardDescription>
                  Create and send your {selectedChannel} message
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedChannel === 'email' && (
                  <>
                    <Input placeholder="Recipient email" />
                    <Input placeholder="Subject line" />
                    <textarea
                      className="w-full min-h-[200px] p-3 border rounded-md resize-none"
                      placeholder="Compose your email message..."
                    />
                  </>
                )}

                {(selectedChannel === 'sms' || selectedChannel === 'whatsapp') && (
                  <>
                    <Input placeholder="Recipient phone number" />
                    <textarea
                      className="w-full min-h-[150px] p-3 border rounded-md resize-none"
                      placeholder={`Compose your ${selectedChannel} message...`}
                    />
                  </>
                )}

                {selectedChannel === 'telegram' && (
                  <>
                    <Input placeholder="Chat ID or Username" />
                    <textarea
                      className="w-full min-h-[150px] p-3 border rounded-md resize-none"
                      placeholder="Compose your Telegram message..."
                    />
                  </>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Template
                    </Button>
                  </div>
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel) => {
              const IconComponent = channel.icon
              return (
                <Card key={channel.id} className={!channel.enabled ? 'opacity-50' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        <CardTitle className="text-lg">{channel.name}</CardTitle>
                      </div>
                      <Badge variant={channel.enabled ? 'default' : 'secondary'}>
                        {channel.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <CardDescription>{channel.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Capabilities:</h4>
                      <div className="flex flex-wrap gap-1">
                        {channel.capabilities.map((capability) => (
                          <Badge key={capability} variant="outline" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {channel.enabled && (
                      <Button className="w-full mt-4" variant="outline">
                        Configure {channel.name}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
              <CardDescription>
                Track all your sent and received messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(log.status)}
                      {getChannelIcon(log.channel)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{log.type}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.channel}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          To: {log.recipient}
                        </p>
                        {log.subject && (
                          <p className="text-sm font-medium">{log.subject}</p>
                        )}
                        <p className="text-sm truncate max-w-md">{log.content}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {log.timestamp.toLocaleString()}
                      </p>
                      {log.cost && (
                        <p className="text-sm font-medium">£{log.cost.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}