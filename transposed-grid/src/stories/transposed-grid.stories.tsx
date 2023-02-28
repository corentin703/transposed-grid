/// <reference path="../components.d.ts" />

import fakeData from './assets/fakeData.json';
import { Group, Row, SelectionMode } from '../models';
import { Meta, StoryFn } from '@storybook/html';
import { ArgTypes } from '@storybook/csf/dist/story';

const rows: Row[] = [
  {
    dataField: 'id',
    visible: true,
    editing: {
      allowUpdating: false,
    },
  },
  {
    caption: 'Name',
    dataField: 'name',
    allowSorting: true,
  },
  {
    caption: 'Company',
    dataField: 'company',
    allowSorting: true,
  },
  {
    caption: 'Birth Date bla bla bla bla bla',
    dataField: 'birthdate',
    allowSorting: true,
  },
  {
    group: 'address',
    caption: 'City',
    dataField: 'city',
    allowSorting: true,
  },
  {
    group: 'address',
    caption: 'Country',
    dataField: 'country',
    allowSorting: true,
  },
  {
    group: 'internet',
    caption: 'Email',
    dataField: 'email',
    allowSorting: true,
  },
  {
    caption: 'Avatar',
    dataField: 'avatar',
    editing: {
      allowUpdating: false,
    },
    cellTemplate: (props: any) => {
      props.element.innerHTML = '';

      if (!props.value) {
        props.element.innerHTML = 'Aucune image';
        return;
      }

      props.element.innerHTML = `<img src="${props.value}" alt="photo" style="width: 5rem; height: 5rem;" />`;
    }
    // cellTemplate: (props, defaultTemplate) => {
    //   // props.setSettings({
    //   //   className: 'bg-red',
    //   //   style: {
    //   //     backgroundColor: 'darkred'
    //   //   }
    //   // })
    //
    //   if (!props.value) {
    //     return <></>
    //   }
    //
    //   return (
    //     <img src={props.value} className={'w-[5rem]'} alt={'avatar'} />
    //   )
    // }
  },
  {
    group: 'address',
    caption: 'Photo',
    dataField: 'photo',
    cellTemplate: (props: any) => {
      props.element.innerHTML = '';

      if (!props.value) {
        props.element.innerHTML = 'Aucune image';
        return;
      }

      props.element.innerHTML = `<img src="${props.value}" alt="photo" style="width: 5rem; height: 5rem;" />`;
    }
  },
  {
    group: 'animal',
    dataField: 'dog',
    caption: 'Dog',
    allowSorting: true,
  },
  {
    group: 'animal',
    dataField: 'cat',
    caption: 'Cat',
    allowSorting: true,
  },
  {
    group: 'animal',
    dataField: 'bird',
    caption: 'Bird',
    allowSorting: true,
  },
  {
    group: 'animal',
    dataField: 'bear',
    caption: 'Bear',
    allowSorting: true,
  },
  {
    group: 'animal',
    caption: 'Country',
    dataField: 'country',
    allowSorting: true,
  },
];

const groups: Group[] = [
  {
    name: 'address',
    caption: 'Address',
    collapsed: false,
    // onGroupCollapsed: (evt) => {
    //   evt.collapsed = false
    // }
  },
  {
    name: 'internet',
    caption: 'Internet of Things & bla bla bla bla bla and bla bla bla',
    collapsed: false,
  },
  {
    name: 'animal',
    caption: 'Animal',
    collapsed: false,
  }
];

const Template = (args: Partial<ArgTypes>) =>  {
  const transposedGrid = document.createElement('transposed-grid') as HTMLTransposedGridElement;

  transposedGrid.addEventListener('keydown', e => e.stopPropagation())

  Object.entries(args).forEach(([key, value]) => {
    if (key.match(/^on[A-Z].*/) && typeof value === 'function') {
      const action = key.replace('on', '').replace(key[2], key[2].toLowerCase());
      transposedGrid.addEventListener(action, value);
      return;
    }

    (transposedGrid as any)[key] = value;
  })

  if (args.editingAllowUpdating) {
    transposedGrid.editing ??= { };
    transposedGrid.editing.allowUpdating = !!args.editingAllowUpdating;
  }

  if (args.selectionMode) {
    transposedGrid.selection ??= { };
    transposedGrid.selection.mode = args.selectionMode as any;
  }

  transposedGrid.primaryKey = 'id';
  transposedGrid.items = fakeData;
  transposedGrid.groups = groups;
  transposedGrid.rows = rows;

  return transposedGrid
}

export default {
  title: 'Grid/Transposed',
  argTypes: {
    striped: {
      control: 'boolean',
      defaultValue: true,
      name: 'Striped',
    },
    editingAllowUpdating: {
      control: 'boolean',
      defaultValue: true,
      name: 'Editing - Allow Updating',
    },
    selectionMode: {
      control: { type: 'select' },
      defaultValue: SelectionMode.Single,
      name: 'Selection mode',
      options: [SelectionMode.None, SelectionMode.Single, SelectionMode.Multiple],
      // type: { name: 'Selection mode', required: false },
      // description: 'Selection mode',
    },
    // backgroundColor: { control: 'color' },
    // label: { control: 'text' },



    onItemClick: {
      action: 'itemClick',
    },
    onItemDoubleClick: {
      action: 'itemDoubleClick',
    },
    onItemHoovering: {
      action: 'itemHoovering',
    },
    onEditionValidation: {
      action: 'editionValidation',
    },
    onSave: {
      action: 'save',
    },
    onCancel: {
      action: 'cancel',
    },
    onItemSelectionChange: {
      action: 'itemSelectionChange',
    },
    onGroupCollapsed: {
      action: 'groupCollapsed',
    },
    // primary: { control: 'boolean' },

  },
} as Meta;

export const Base: StoryFn = Template.bind({})
Base.args = {
  striped: true,
}

