'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  MessageSquare,
  Send,
  Phone,
  Mail,
  Plus,
  Search,
  MoreVertical,
  Check,
  CheckCheck,
} from 'lucide-react'
import { mockData } from '@/data/mockData'
import { Message, Conversation } from '@/types'
import { formatDate } from '@/lib/utils'

const channelIcons = {
  sms: Phone,
  whatsapp: MessageSquare,
  telegram: MessageSquare,
  email: Mail,
}

const channelColors = {
  sms: 'bg-blue-500',
  whatsapp: 'bg-green-500',
  telegram: 'bg-blue-400',
  email: 'bg-purple-500',
}

export default function PulsePage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const conversations = mockData.conversations
  const messages = mockData.messages

  const filteredConversations = conversations.filter(conv => {
    const user = mockData.users.find(u => u.id === conv.userId)
    return user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || false
  })

  const conversationMessages = selectedConversation
    ? messages.filter(m => m.userId === selectedConversation.userId)
    : []

  const selectedUser = selectedConversation
    ? mockData.users.find(u => u.id === selectedConversation.userId)
    : null

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    // In real app, this would send the message via API
    console.log('Sending message:', newMessage)
    setNewMessage('')
  }

  const getChannelIcon = (channel: Message['channel']) => {
    const IconComponent = channelIcons[channel] || MessageSquare
    return <IconComponent className="h-4 w-4" />
  }

  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] flex">
        {/* Conversations Sidebar */}
        <div className="w-80 border-r bg-background">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Pulse Messages</h2>
              <Button size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-y-auto h-full">
            {filteredConversations.map((conversation) => {
              const user = mockData.users.find(u => u.id === conversation.userId)
              const lastMessage = messages
                .filter(m => m.userId === conversation.userId)
                .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())[0]

              return (
                <div
                  key={conversation.id}
                  className={`p-4 border-b cursor-pointer hover:bg-accent/50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {lastMessage ? formatDate(lastMessage.sentAt, { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        {lastMessage && (
                          <>
                            <div className={`w-2 h-2 rounded-full ${channelColors[lastMessage.channel]}`} />
                            <p className="text-sm text-muted-foreground truncate">
                              {lastMessage.content}
                            </p>
                          </>
                        )}
                      </div>

                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="mt-1 text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation && selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-background">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedUser.avatarUrl} />
                      <AvatarFallback>
                        {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Active
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversationMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.direction === 'outbound'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">
                          {formatDate(message.sentAt, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {message.direction === 'outbound' && (
                          <div className="flex ml-2">
                            {message.status === 'sent' && <Check className="h-3 w-3" />}
                            {message.status === 'delivered' && <CheckCheck className="h-3 w-3" />}
                            {message.status === 'read' && <CheckCheck className="h-3 w-3 text-blue-500" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-background">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* Channel Selection */}
                <div className="flex gap-2 mt-2">
                  {Object.entries(channelIcons).map(([channel, IconComponent]) => (
                    <Button
                      key={channel}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <IconComponent className="h-3 w-3 mr-1" />
                      {channel}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p>Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}